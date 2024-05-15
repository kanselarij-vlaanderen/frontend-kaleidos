import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { singularize } from 'ember-inflector';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import fetch from 'fetch';
import { startOfDay } from 'date-fns';

export default class AgendaService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service currentSession;
  @service newsletterService;
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

  /* API: agenda-submission-service */

  /**
   * @argument meeting
   * @argument subcase
   * @argument formallyOk: optional
   * @argument privateComment: optional
   */
  async putSubmissionOnAgenda(meeting, subcase, formallyOk = false, privateComment = null) {
    // TODO I moved this part because saving subcase here after a service call will break relations
    // Ideally we want to move this to the service?
    await subcase.type;
    if (subcase.isBekrachtiging) {
      const decisionmakingFlow = await subcase.decisionmakingFlow;
      const latestApprovalSubcase = await this.store.queryOne('subcase', {
        filter: {
          'decisionmaking-flow': {
            ':id:': decisionmakingFlow.id,
          },
          'type': {
            ':uri:': CONSTANTS.SUBCASE_TYPES.DEFINITIEVE_GOEDKEURING
          }
        },
        sort: '-created',
      });
      if (latestApprovalSubcase) {
        let ratifiedBy = await latestApprovalSubcase.mandatees;
        ratifiedBy = ratifiedBy?.slice();
        // add the current prime minister if not present
        if (!ratifiedBy) {
          ratifiedBy = [];
        }
        const primeMinister = await this.store.queryOne('mandatee', {
          'filter[mandate][role][:uri:]': CONSTANTS.MANDATE_ROLES.MINISTER_PRESIDENT,
          'filter[:lte:start]': startOfDay(new Date()).toISOString(),
          'filter[:has-no:end]': true,
          include: 'person,mandate.role',
        });
        const ratifiedByIds = ratifiedBy.map((signer) => signer.id);
        if (!ratifiedByIds.includes(primeMinister.id)) {
          ratifiedBy.push(primeMinister);
        }
        await subcase.ratifiedBy;
        subcase.ratifiedBy = ratifiedBy;
        await subcase.save();
        await subcase.hasMany('ratifiedBy').reload(); // TODO we set the list, so we shouldn't have to reload?
      }
    }
    const url = `/meetings/${meeting.id}/submit`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' },
      body: JSON.stringify({
        subcase: subcase.uri,
        formallyOk: formallyOk,
        privateComment: privateComment,
      })
    });
    let json;
    try {
      json = await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(
          `Backend response contained an error (status: ${response.status})`
        );
      } else {
        throw error;
      }
    }
    if (!response.ok) {
      throw new Error(
        `Backend response contained an error (status: ${
          response.status
        }): ${JSON.stringify(json)}`);
    }
    const agendaitem = await this.store.findRecord('agendaitem', json.data.id);
    await subcase.hasMany('agendaActivities').reload();
    await subcase.hasMany('submissionActivities').reload();
    return agendaitem;
  }

  /* No API */

  async groupAgendaitemsOnGroupName(agendaitems) {
    let previousAgendaitemGroupName;
    return Promise.all(
      agendaitems.map(async (agendaitem) => {
        let currentAgendaitemGroupName;
        const mandatees = await agendaitem.mandatees;
        const sortedMandatees = mandatees
          .slice()
          .sort((m1, m2) => m1.priority - m2.priority);
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
    if (this.currentSession.may('remove-approved-agendaitems')) {
      await this.deleteAgendaitem(agendaitem);
    } else {
      this.toaster.error(
        this.intl.t('action-not-allowed'),
        this.intl.t('warning-title')
      );
    }
  }
}
