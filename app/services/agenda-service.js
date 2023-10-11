import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { singularize } from 'ember-inflector';
import fetch from 'fetch';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import ENV from 'frontend-kaleidos/config/environment';

export default class AgendaService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service currentSession;
  @service newsletterService;
  @service mandatees;
  @service signatureService;

  @tracked addedPieces = null;
  @tracked addedAgendaitems = null;

  /* API: agenda-sort-service */

  async agendaWithChanges(currentAgendaID, agendaToCompareID) {
    const endpoint = new URL(
      '/agenda-comparison/agenda-with-changes',
      window.location.origin
    );
    const queryParams = new URLSearchParams(
      Object.entries({
        agendaToCompare: agendaToCompareID,
        selectedAgenda: currentAgendaID,
      })
    );
    endpoint.search = queryParams.toString();
    const response = await fetch(endpoint);
    if (response.ok) {
      const result = await response.json();
      this.addedPieces = result.addedDocuments;
      this.addedAgendaitems = result.addedAgendaitems;
    }
  }

  async newAgendaItems(currentAgendaId, comparedAgendaId) {
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-items`;
    const response = await fetch(url);
    const payload = await response.json();
    const itemsFromStore = [];
    for (const item of payload.data) {
      let itemFromStore = this.store.peekRecord(
        singularize(item.type),
        item.id
      );
      if (!itemFromStore) {
        itemFromStore = await this.store.queryRecord(
          singularize(item.type),
          item.id
        );
      }
      itemsFromStore.push(itemFromStore);
    }
    return itemsFromStore;
  }

  async modifiedAgendaItems(currentAgendaId, comparedAgendaId, scopeFields) {
    // scopefields specify which fields to base upon for determining if an item was modified
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-items?changeset=modified&scope=${scopeFields.join(
      ','
    )}`;
    const response = await fetch(url);
    const payload = await response.json();
    const itemsFromStore = [];
    for (const item of payload.data) {
      let itemFromStore = this.store.peekRecord(
        singularize(item.type),
        item.id
      );
      if (!itemFromStore) {
        itemFromStore = await this.store.queryRecord(
          singularize(item.type),
          item.id
        );
      }
      itemsFromStore.push(itemFromStore);
    }
    return itemsFromStore;
  }

  async changedPieces(currentAgendaId, comparedAgendaId, agendaItemId) {
    if (!this.currentSession.may('view-document-version-info')) {
      return [];
    }
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-item/${agendaItemId}/pieces`;
    const response = await fetch(url);
    const payload = await response.json();
    const piecesFromStore = [];
    for (const piece of payload.data) {
      let pieceFromStore = this.store.peekRecord(
        singularize(piece.type),
        piece.id
      );
      if (!pieceFromStore) {
        pieceFromStore = await this.store.queryRecord(
          singularize(piece.type),
          piece.id
        );
      }
      piecesFromStore.push(pieceFromStore);
    }
    return piecesFromStore;
  }

  /* No API */

  async computeNextItemNumber(agenda, agendaItemType) {
    const lastItem = await this.store.queryOne('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      'filter[type][:id:]': agendaItemType.get('id'),
      sort: '-number',
    });
    if (lastItem) {
      return lastItem.number + 1;
    }
    return 1;
  }

  get enableDigitalAgenda() {
    return (
      ENV.APP.ENABLE_DIGITAL_AGENDA === 'true' ||
      ENV.APP.ENABLE_DIGITAL_AGENDA === true
    );
  }

  /**
   * @argument meeting
   * @argument submissionActivities: Array of submission activities. Mostly only one exists before submission.
   * In the case where an agenda-item was deleted after multiple submissions occurred, one can put on agenda again with multiple submissions
   */
  async putSubmissionOnAgenda(meeting, submissionActivities) {
    const subcase = await submissionActivities[0].get('subcase');
    const lastAgenda = await this.store.queryOne('agenda', {
      'filter[created-for][:id:]': meeting.id,
      'filter[status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
      sort: '-created', // serialnumber
    });
    const agendaItemType = await subcase.agendaItemType;
    const numberToAssign = await this.computeNextItemNumber(
      lastAgenda,
      agendaItemType
    );
    const mandatees = await subcase.get('mandatees');
    const now = new Date();

    // Placement on agenda activity
    const agendaActivity = await this.store.createRecord('agenda-activity', {
      startDate: now,
      subcase,
    });
    await agendaActivity.save();
    for (const submissionActivity of submissionActivities) {
      submissionActivity.agendaActivity = agendaActivity;
      await submissionActivity.save();
    }

    // default secretary
    const decisionSecretary = {};
    if (this.enableDigitalAgenda) {
      const meetingSecretary = await meeting.secretary;
      if (meetingSecretary) {
        decisionSecretary.secretary = meetingSecretary;
      } else {
        decisionSecretary.secretary = await this.mandatees.getCurrentApplicationSecretary();
      }
    }
    // decision-activity
    const decisionActivity = await this.store.createRecord(
      'decision-activity',
      {
        subcase,
        startDate: meeting.plannedStart,
        ...decisionSecretary,
      }
    );
    await decisionActivity.save();

    // Treatment
    const agendaItemTreatment = await this.store.createRecord(
      'agenda-item-treatment',
      {
        created: now,
        modified: now,
        decisionActivity,
      }
    );
    await agendaItemTreatment.save();

    let submittedPieces = [];
    for (const submissionActivity of submissionActivities) {
      const submissionActivity2 = await this.store.queryOne(
        'submission-activity',
        {
          'filter[:id:]': submissionActivity.id,
          include: 'pieces', // query with include to avoid pagination issues
        }
      );
      submittedPieces = submittedPieces.concat(
        (await submissionActivity2.pieces).toArray()
      );
    }

    // signFlows
    for (const piece of submittedPieces) {
      await this.signatureService.replaceDecisionActivity(
        piece,
        decisionActivity
      );
    }

    const agendaitem = await this.store.createRecord('agendaitem', {
      created: now,
      number: numberToAssign,
      agenda: lastAgenda,
      title: subcase.title,
      shortTitle: subcase.shortTitle,
      formallyOk: CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK,
      type: agendaItemType,
      mandatees,
      pieces: submittedPieces,
      linkedPieces: await subcase.linkedPieces,
      agendaActivity,
      treatment: agendaItemTreatment,
    });
    await agendaitem.save();
    await lastAgenda.hasMany('agendaitems').reload();
    await subcase.hasMany('agendaActivities').reload();
    await subcase.hasMany('submissionActivities').reload();
    lastAgenda.modified = new Date();
    lastAgenda.save();

    // Create default newsItem for announcements with inNewsLetter = true
    if (agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
      const newsItem = await this.newsletterService.createNewsItemForAgendaitem(
        agendaitem,
        true
      );
      newsItem.save();
    }
    return agendaitem;
  }

  async groupAgendaitemsOnGroupName(agendaitems) {
    let previousAgendaitemGroupName;
    return Promise.all(
      agendaitems.map(async (agendaitem) => {
        let currentAgendaitemGroupName;
        const mandatees = await agendaitem.mandatees;
        const sortedMandatees = mandatees.sortBy('priority');
        if (agendaitem.isApproval) {
          agendaitem.set('groupName', null);
          agendaitem.set('ownGroupName', null);
          return;
        }
        if (sortedMandatees.length === 0) {
          agendaitem.set('groupName', this.intl.t('no-mandatee-assigned'));
          currentAgendaitemGroupName = this.intl.t('no-mandatee-assigned');
        } else {
          currentAgendaitemGroupName = sortedMandatees
            .map((mandatee) => mandatee.title)
            .join('<br/>');
        }

        if (currentAgendaitemGroupName !== previousAgendaitemGroupName) {
          previousAgendaitemGroupName = currentAgendaitemGroupName;
          agendaitem.set('groupName', currentAgendaitemGroupName);
        } else {
          agendaitem.set('groupName', null);
        }
        agendaitem.set('ownGroupName', currentAgendaitemGroupName);
      })
    );
  }

  async deleteAgendaitem(agendaitem) {
    const agendaitemToDelete = await this.store.findRecord(
      'agendaitem',
      agendaitem.get('id'),
      {
        reload: true,
      }
    );
    agendaitemToDelete.set('aboutToDelete', true);
    const agendaActivity = await agendaitemToDelete.agendaActivity;
    const treatment = await agendaitemToDelete.treatment;

    if (agendaActivity) {
      const subcase = await agendaActivity.subcase;
      await agendaActivity.hasMany('agendaitems').reload();
      const agendaitemsFromActivity = await agendaActivity.agendaitems;
      if (treatment) {
        const decisionActivity = await treatment.decisionActivity;
        const newsItem = await treatment.newsItem;
        if (newsItem) {
          await newsItem.destroyRecord();
        }
        if (decisionActivity) {
          await decisionActivity.destroyRecord();
        }
        // TODO DELETE REPORT !
        await treatment.destroyRecord();
      }
      await Promise.all(
        agendaitemsFromActivity.map(async (agendaitem) => {
          const agenda = await agendaitem.agenda;
          await agendaitem.destroyRecord();
          await agenda.hasMany('agendaitems').reload();
        })
      );
      await agendaActivity.destroyRecord();
      await subcase.hasMany('agendaActivities').reload();
      await subcase.hasMany('decisionActivities').reload();
    } else {
      await agendaitemToDelete.destroyRecord();
    }
  }

  async deleteAgendaitemFromMeeting(agendaitem) {
    if (this.currentSession.isAdmin) {
      await this.deleteAgendaitem(agendaitem);
    } else {
      this.toaster.error(
        this.intl.t('action-not-allowed'),
        this.intl.t('warning-title')
      );
    }
  }
}
