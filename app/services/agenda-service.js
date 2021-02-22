import Service, { inject as service } from '@ember/service';
import { singularize } from 'ember-inflector';
import { notifyPropertyChange } from '@ember/object';
import { bind } from '@ember/runloop';
import { ajax } from 'frontend-kaleidos/utils/ajax';
import CONFIG from 'frontend-kaleidos/utils/config';
import { updateModifiedProperty } from 'frontend-kaleidos/utils/modification-utils';
import { A } from '@ember/array';

export default Service.extend({
  store: service(),
  toaster: service(),
  intl: service(),
  currentSession: service(),
  newsletterService: service(),

  addedPieces: null,
  addedAgendaitems: null,

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

  async getPieceNames(model) {
    return ajax({
      method: 'GET',
      url: `/lazy-loading/documentNames?uuid=${model.id}`,
    }).then((result) => result.body.documentNames);
  },

  async rollbackAgendaitemsNotFormallyOk(agendaToRollback) {
    if (!agendaToRollback) {
      return agendaToRollback;
    }
    // Triggers the agendaApproveService to rollback the not formal ok agendaitems on the agenda.
    await ajax({
      method: 'POST',
      url: '/agenda-approve/rollbackAgendaitemsNotFormallyOk',
      data: {
        oldAgendaId: agendaToRollback.id,
      },
    });
  },

  async approveAgendaAndCopyToDesignAgenda(currentMeeting, oldAgenda) {
    if (!oldAgenda) {
      return oldAgenda;
    }
    // Use approveagendaService to duoplicate Agendaitems into new agenda.
    const result = await ajax({
      method: 'POST',
      url: '/agenda-approve/approveAgenda',
      data: {
        createdFor: currentMeeting.id,
        oldAgendaId: oldAgenda.id,
      },
    });
    notifyPropertyChange(oldAgenda, 'agendaitems');
    const newAgenda = await this.store.find('agenda', result.body.newAgenda.id);
    notifyPropertyChange(newAgenda, 'agendaitems');
    return newAgenda;
  },

  async deleteAgenda(agendaToDelete) {
    if (!agendaToDelete) {
      return;
    }
    try {
      // Use approveagendaService to delete agendaitems and agenda.
      await ajax({
        method: 'POST',
        url: '/agenda-approve/deleteAgenda',
        data: {
          agendaToDeleteId: agendaToDelete.id,
        },
      });
    } catch (error) {
      console.warn('An error ocurred: ', error);
      this.toaster.error(this.intl.t('error-delete-agenda'), this.intl.t('warning-title'));
    }
  },

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

  async changedPieces(currentAgendaId, comparedAgendaId, agendaItemId) {
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-item/${agendaItemId}/pieces`;
    const response = await fetch(url);
    const payload = await response.json();
    const piecesFromStore = [];
    for (const piece of payload.data) {
      let pieceFromStore = this.store.peekRecord(singularize(piece.type), piece.id);
      if (!pieceFromStore) {
        pieceFromStore = this.store.queryRecord(singularize(piece.type), piece.id);
      }
      piecesFromStore.push(pieceFromStore);
    }
    return piecesFromStore;
  },

  async computeNextItemNumber(agenda, isAnnouncement) {
    const lastItem = await this.store.queryOne('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      'filter[show-as-remark]': isAnnouncement,
      sort: '-priority',
    });
    if (lastItem) {
      return lastItem.priority + 1;
    }
    return 1;
  },

  async putSubmissionOnAgenda(meeting, submissionActivity) {
    const subcase = await submissionActivity.get('subcase');
    const lastAgenda = await this.store.queryOne('agenda', {
      'filter[created-for][:id:]': meeting.id,
      'filter[status][:uri:]': CONFIG.agendaStatusDesignAgenda.uri,
      sort: '-created', // serialnumber
    });
    const isAnnouncement = subcase.get('showAsRemark');
    const priorityToAssign = await this.computeNextItemNumber(lastAgenda, isAnnouncement);

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
    submissionActivity.set('agendaActivity', agendaActivity);
    await submissionActivity.save();

    // load code-list item
    const defaultDecisionResultCodeUri = isAnnouncement ? CONFIG.DECISION_RESULT_CODE_URIS.KENNISNAME : CONFIG.DECISION_RESULT_CODE_URIS.GOEDGEKEURD;
    const decisionResultCode = await this.store.queryOne('decision-result-code', {
      'filter[:uri:]': defaultDecisionResultCodeUri,
    });

    // Treatment of agenda-item / decision activity
    const agendaItemTreatment = await this.store.createRecord('agenda-item-treatment', {
      created: now,
      modified: now,
      subcase,
      decisionResultCode,
    });
    await agendaItemTreatment.save();

    const submissionActivity2 = await this.store.queryOne('submission-activity', {
      'filter[:id:]': submissionActivity.id,
      include: 'pieces',
    });
    const submittedPieces = await submissionActivity2.pieces;
    const agendaitem = await this.store.createRecord('agendaitem', {
      retracted: false,
      titlePress: subcase.shortTitle,
      textPress: pressText,
      created: now,
      priority: priorityToAssign,
      agenda: lastAgenda,
      title: subcase.title,
      shortTitle: subcase.shortTitle,
      formallyOk: CONFIG.notYetFormallyOk,
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
