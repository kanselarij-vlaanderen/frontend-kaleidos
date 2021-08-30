import Service, { inject as service } from '@ember/service';
import { singularize } from 'ember-inflector';
import { bind } from '@ember/runloop';
import { ajax } from 'frontend-kaleidos/utils/ajax';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { updateModifiedProperty } from 'frontend-kaleidos/utils/modification-utils';
import { A } from '@ember/array';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Service.extend({
  store: service(),
  toaster: service(),
  intl: service(),
  currentSession: service(),
  newsletterService: service(),

  addedPieces: null,
  addedAgendaitems: null,

  /* API: session-service */

  assignNewSessionNumbers() {
    return ajax({
      method: 'GET',
      url: '/session-service/assignNewSessionNumbers',
    });
  },

  getClosestMeetingAndAgendaId(date) {
    return ajax({
      method: 'GET',
      url: `/session-service/closestMeeting?date=${date}`,
    }).then((result) => result.body.closestMeeting);
  },

  getActiveAgendas(date) {
    return ajax({
      method: 'GET',
      url: `/session-service/activeAgendas?date=${date}`,
    }).then((result) => result.body.agendas);
  },

  /* API: agenda-approve-service */

  // TODO KAS-2452 rename this.
  async approveAgendaAndCopyToDesignAgenda(currentMeeting, oldAgenda) {
    // TODO KAS-2452 do we need this if the api returns error
    if (!oldAgenda) {
      return oldAgenda;
    }
    const result = await ajax({
      method: 'POST',
      url: '/agenda-approve/approveAgenda',
      data: {
        meetingId: currentMeeting.id,
        oldAgendaId: oldAgenda.id,
      },
    });
    if (result.error) {
      // TODO KAS-2452 popup
    }
    const newAgenda = await this.store.find('agenda', result.body.newAgenda.id);
    return newAgenda;
  },

  async approveAgendaAndCloseMeeting(currentMeeting, agendaToApprove) {
    await ajax({
      method: 'POST',
      url: '/agenda-approve/approveAgendaAndCloseMeeting',
      data: {
        meetingId: currentMeeting.id,
        agendaId: agendaToApprove.id,
      },
    });
    return;
  },

  async closeMeeting(currentMeeting) {
    const result = await ajax({
      method: 'POST',
      url: '/agenda-approve/closeMeeting',
      data: {
        meetingId: currentMeeting.id,
      },
    });
    const lastApprovedAgenda = await this.store.queryOne('agenda', {
      'filter[:id:]': result.body.lastApprovedAgenda.id,
    });
    return lastApprovedAgenda;
  },

  async reopenPreviousAgenda(currentMeeting) {
    const result = await ajax({
      method: 'POST',
      url: '/agenda-approve/reopenPreviousAgenda',
      data: {
        meetingId: currentMeeting.id,
      },
    });
    const reopenedAgenda = await this.store.queryOne('agenda', {
      'filter[:id:]': result.body.reopenedAgenda.id,
    });
    return reopenedAgenda;
  },

  async deleteAgenda(currentMeeting, agendaToDelete) {
    try {
      const result = await ajax({
        method: 'POST',
        url: '/agenda-approve/deleteAgenda',
        data: {
          agendaId: agendaToDelete.id,
          meetingId: currentMeeting.id,
        },
      });
      if (result.body?.lastApprovedAgenda) {
        return await this.store.queryOne('agenda', {
          'filter[:id:]': result.body.lastApprovedAgenda.id,
        });
      }
    } catch (error) {
      // TODO KAS-2452 not hitting this anymore... 
      console.warn('An error ocurred: ', error);
      this.toaster.error(this.intl.t('error-delete-agenda'), this.intl.t('warning-title'));
    }
  },

  /* API: agenda-sort-service */

  agendaWithChanges(currentAgendaID, agendaToCompareID) {
    return ajax({
      method: 'GET',
      url: `/agenda-sort/agenda-with-changes?agendaToCompare=${agendaToCompareID}&selectedAgenda=${currentAgendaID}`,
    })
      .then(bind(this, (result) => {
        this.set('addedPieces', result.addedDocuments);
        this.set('addedAgendaitems', result.addedAgendaitems);
        return result;
      }))
      .catch(() => {

      });
  },

  async newAgendaItems(currentAgendaId, comparedAgendaId) {
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-items`;
    const response = await fetch(url);
    const payload = await response.json();
    const itemsFromStore = [];
    for (const item of payload.data) {
      let itemFromStore = this.store.peekRecord(singularize(item.type), item.id);
      if (!itemFromStore) {
        itemFromStore = await this.store.queryRecord(singularize(item.type), item.id);
      }
      itemsFromStore.push(itemFromStore);
    }
    return itemsFromStore;
  },

  async modifiedAgendaItems(currentAgendaId, comparedAgendaId, scopeFields) {
    // scopefields specify which fields to base upon for determining if an item was modified
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-items?changeset=modified&scope=${scopeFields.join(',')}`;
    const response = await fetch(url);
    const payload = await response.json();
    const itemsFromStore = [];
    for (const item of payload.data) {
      let itemFromStore = this.store.peekRecord(singularize(item.type), item.id);
      if (!itemFromStore) {
        itemFromStore = await this.store.queryRecord(singularize(item.type), item.id);
      }
      itemsFromStore.push(itemFromStore);
    }
    return itemsFromStore;
  },

  async changedPieces(currentAgendaId, comparedAgendaId, agendaItemId) {
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-item/${agendaItemId}/pieces`;
    const response = await fetch(url);
    const payload = await response.json();
    const piecesFromStore = [];
    for (const piece of payload.data) {
      let pieceFromStore = this.store.peekRecord(singularize(piece.type), piece.id);
      if (!pieceFromStore) {
        pieceFromStore = await this.store.queryRecord(singularize(piece.type), piece.id);
      }
      piecesFromStore.push(pieceFromStore);
    }
    return piecesFromStore;
  },

  /* No API */

  async computeNextItemNumber(agenda, isAnnouncement) {
    const lastItem = await this.store.queryOne('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      'filter[show-as-remark]': isAnnouncement,
      sort: '-number',
    });
    if (lastItem) {
      return lastItem.number + 1;
    }
    return 1;
  },

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
    const isAnnouncement = subcase.get('showAsRemark');
    const numberToAssign = await this.computeNextItemNumber(lastAgenda, isAnnouncement);

    // Generate press text
    const mandatees = await subcase.get('mandatees');
    const sortedMandatees = await mandatees.sortBy('priority');
    const titles = sortedMandatees.map((mandatee) => mandatee.get('title'));
    const pressText = `${subcase.get('shortTitle')}\n${titles.join('\n')}`;

    const now = new Date();

    // Placement on agenda activity
    const agendaActivity = await this.store.createRecord('agenda-activity', {
      startDate: now,
      subcase,
    });
    await agendaActivity.save();
    for (const submissionActivity of submissionActivities) {
      submissionActivity.set('agendaActivity', agendaActivity);
      await submissionActivity.save();
    }

    // load code-list item
    const defaultDecisionResultCodeUri = isAnnouncement ? CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME : CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD;
    const decisionResultCode = await this.store.queryOne('decision-result-code', {
      'filter[:uri:]': defaultDecisionResultCodeUri,
    });

    // Treatment of agenda-item / decision activity
    const agendaItemTreatment = await this.store.createRecord('agenda-item-treatment', {
      created: now,
      modified: now,
      subcase,
      startDate: meeting.plannedStart,
      decisionResultCode,
    });
    await agendaItemTreatment.save();

    let submittedPieces = [];
    for (const submissionActivity of submissionActivities) {
      const submissionActivity2 = await this.store.queryOne('submission-activity', {
        'filter[:id:]': submissionActivity.id,
        include: 'pieces', // query with include to avoid pagination issues
      });
      submittedPieces = submittedPieces.concat((await submissionActivity2.pieces).toArray());
    }
    const agendaitem = await this.store.createRecord('agendaitem', {
      retracted: false,
      titlePress: subcase.shortTitle,
      textPress: pressText,
      created: now,
      number: numberToAssign,
      agenda: lastAgenda,
      title: subcase.title,
      shortTitle: subcase.shortTitle,
      formallyOk: CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK,
      showAsRemark: isAnnouncement,
      mandatees,
      pieces: submittedPieces,
      linkedPieces: await subcase.linkedPieces,
      agendaActivity,
      treatments: A([agendaItemTreatment]),
    });
    await agendaitem.save();
    await lastAgenda.hasMany('agendaitems').reload();
    await subcase.hasMany('agendaActivities').reload();
    await subcase.hasMany('treatments').reload();
    subcase.set('requestedForMeeting', meeting);
    await subcase.save();
    updateModifiedProperty(lastAgenda);

    // Create default newsletterInfo for announcements with inNewsLetter = true
    if (agendaitem.showAsRemark) {
      const newsItem = await this.newsletterService.createNewsItemForAgendaitem(agendaitem, true);
      newsItem.save();
    }
    return agendaitem;
  },

  async groupAgendaitemsOnGroupName(agendaitems) {
    let previousAgendaitemGroupName;
    return Promise.all(
      agendaitems.map(async(agendaitem) => {
        let currentAgendaitemGroupName;
        const mandatees = await agendaitem.get('sortedMandatees');
        if (agendaitem.isApproval) {
          agendaitem.set('groupName', null);
          agendaitem.set('ownGroupName', null);
          return;
        }
        if (mandatees.length === 0) {
          agendaitem.set('groupName', this.intl.t('no-mandatee-assigned'));
          currentAgendaitemGroupName = this.intl.t('no-mandatee-assigned');
        } else {
          currentAgendaitemGroupName = mandatees
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
  },

  async deleteAgendaitem(agendaitem) {
    const agendaitemToDelete = await this.store.findRecord('agendaitem', agendaitem.get('id'), {
      reload: true,
    });
    agendaitemToDelete.set('aboutToDelete', true);
    const agendaActivity = await agendaitemToDelete.get('agendaActivity');
    const treatments = await agendaitemToDelete.get('treatments');

    if (agendaActivity) {
      const subcase = await agendaActivity.get('subcase');
      await agendaActivity.hasMany('agendaitems').reload();
      const agendaitemsFromActivity = await agendaActivity.get('agendaitems');
      if (treatments) {
        await Promise.all(treatments.map(async(treatment) => {
          const newsletter = await treatment.get('newsletterInfo');
          if (newsletter) {
            await newsletter.destroyRecord();
          }
          // TODO DELETE REPORT !
          await treatment.destroyRecord();
        }));
      }
      await Promise.all(agendaitemsFromActivity.map(async(agendaitem) => {
        const agenda = await agendaitem.get('agenda');
        await agendaitem.destroyRecord();
        await agenda.hasMany('agendaitems').reload();
      }));
      await agendaActivity.destroyRecord();
      await subcase.set('requestedForMeeting', null);
      await subcase.save();
      await subcase.hasMany('agendaActivities').reload();
      await subcase.hasMany('treatments').reload();
    } else {
      await agendaitemToDelete.destroyRecord();
    }
  },

  async deleteAgendaitemFromMeeting(agendaitem) {
    if (this.currentSession.isAdmin) {
      return await this.deleteAgendaitem(agendaitem);
    }
    this.toaster.error(this.intl.t('action-not-allowed'), this.intl.t('warning-title'));
  },

  async retrieveModifiedDateFromNota(agendaitem) {
    const nota = await agendaitem.get('nota');
    if (!nota) {
      return null;
    }
    const pieces = await nota.get('pieces');
    const hasRevision = pieces.length > 1;
    if (hasRevision) {
      const lastPiece = await nota.get('lastPiece');
      return lastPiece.created;
    }
    return null;
  },
});
