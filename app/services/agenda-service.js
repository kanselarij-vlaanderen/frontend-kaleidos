import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { singularize } from 'ember-inflector';
import fetch from 'fetch';

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
   */
  async putSubmissionOnAgenda(meeting, subcase) {
    const url = `/meetings/${meeting.id}/submit`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' },
      body: JSON.stringify({ subcase: subcase.uri })
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
