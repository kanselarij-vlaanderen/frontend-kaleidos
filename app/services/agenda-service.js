import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { notifyPropertyChange } from '@ember/object';
import { bind } from '@ember/runloop';
import { ajax } from 'fe-redpencil/utils/ajax';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';
import { updateModifiedProperty } from 'fe-redpencil/utils/modification-utils';

export default Service.extend({
  store: service(),
  toaster: service(),
  intl: service(),
  currentSession: service(),

  addedDocuments: null,
  addedAgendaitems: null,

  assignNewSessionNumbers() {
    return ajax({
      method: 'GET',
      url: `/session-service/assignNewSessionNumbers`,
    });
  },

  getClosestMeetingAndAgendaId(date) {
    return ajax({
      method: 'GET',
      url: `/session-service/closestMeeting?date=${date}`,
    }).then((result) => {
      return result.body.closestMeeting;
    });
  },

  getActiveAgendas(date) {
    return ajax({
      method: 'GET',
      url: `/session-service/activeAgendas?date=${date}`,
    }).then((result) => {
      return result.body.agendas;
    });
  },

  async getDocumentNames(model) {
    return ajax({
      method: 'GET',
      url: `/lazy-loading/documentNames?uuid=${model.id}`,
    }).then((result) => {
      return result.body.documentNames;
    });
  },

  async approveAgendaAndCopyToDesignAgenda(currentMeeting, oldAgenda) {
    if (!oldAgenda) {
      return oldAgenda;
    }
    // Use approveagendaService to duoplicate AgendaItems into new agenda.
    let result = await ajax({
      method: 'POST',
      url: '/agenda-approve/approveAgenda',
      data: {
        createdFor: currentMeeting.id,
        oldAgendaId: oldAgenda.id,
      },
    });
    notifyPropertyChange(oldAgenda, 'agendaitems');
    let newAgenda = await this.store.find('agenda', result.body.newAgenda.id);
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
      this.toaster.error(this.intl.t('error-delete-agenda'), this.intl.t('warning-title'));
    }
  },

  agendaWithChanges(currentAgendaID, agendaToCompareID) {
    return ajax({
      method: 'GET',
      url: `/agenda-sort/agenda-with-changes?agendaToCompare=${agendaToCompareID}&selectedAgenda=${currentAgendaID}`,
    })
      .then(bind(this, (result) => {
        this.set('addedDocuments', result.addedDocuments);
        this.set('addedAgendaitems', result.addedAgendaitems);
        return result;
      }))
      .catch(() => {

      });
  },

  async createNewAgendaItem(selectedAgenda, subcase, index) {
    await selectedAgenda.hasMany('agendaitems').reload();
    let priorityToAssign = 0;
    const mandatees = await subcase.get('mandatees');
    const sortedMandatees = await mandatees.sortBy('priority');
    const titles = sortedMandatees.map((mandatee) => mandatee.get('title'));
    const pressText = `${subcase.get('shortTitle')}\n${titles.join('\n')}`;
    const isAnnouncement = subcase.get('showAsRemark');
    if (isAnnouncement) {
      priorityToAssign = (await selectedAgenda.get('lastAnnouncementPriority')) + 1;
    } else {
      priorityToAssign = (await selectedAgenda.get('lastAgendaitemPriority')) + 1;
    }

    if (isNaN(priorityToAssign)) {
      priorityToAssign = 1;
    }

    if (index) {
      priorityToAssign += index;
    }

    const agendaActivity = await this.store.createRecord('agenda-activity', {
      startDate: moment().utc().toDate(),
      subcase: subcase,
    });
    await agendaActivity.save();
    
    const agendaitem = await this.store.createRecord('agendaitem', {
      retracted: false,
      titlePress: subcase.get('shortTitle'),
      textPress: pressText,
      created: moment()
        .utc()
        .toDate(),
      priority: priorityToAssign,
      agenda: selectedAgenda,
      title: subcase.get('title'),
      shortTitle: subcase.get('shortTitle'),
      formallyOk: CONFIG.notYetFormallyOk,
      showAsRemark: isAnnouncement,
      mandatees: mandatees,
      documentVersions: await subcase.get('documentVersions'),
      linkedDocumentVersions: await subcase.get('linkedDocumentVersions'),
      agendaActivity: agendaActivity
    });
    await agendaitem.save();
    const meeting = await selectedAgenda.get('createdFor');
    await selectedAgenda.hasMany('agendaitems').reload();
    subcase.set('requestedForMeeting', meeting);
    await subcase.hasMany('agendaActivities').reload();
    await subcase.save();
    await updateModifiedProperty(selectedAgenda);
  },

  async groupAgendaItemsOnGroupName(agendaitems) {
    let previousAgendaitemGroupName;
    return Promise.all(
      agendaitems.map(async (item) => {
        const mandatees = await item.get('sortedMandatees');
        if (item.isApproval) {
          item.set('groupName', null);
          item.set('ownGroupName', null);
          return;
        }
        if (mandatees.length == 0) {
          item.set('groupName', 'Geen toegekende ministers');
          return;
        }
        const currentAgendaitemGroupName = mandatees
          .map((mandatee) => mandatee.title)
          .join('<br/>');

        if (currentAgendaitemGroupName != previousAgendaitemGroupName) {
          previousAgendaitemGroupName = currentAgendaitemGroupName;
          item.set('groupName', currentAgendaitemGroupName);
        } else {
          item.set('groupName', null);
        }
        item.set('ownGroupName', currentAgendaitemGroupName);
      })
    );
  },
// TODO KAS-1425
  async deleteAgendaitem(agendaitem) {
    debugger;
    let itemToDelete = await this.store.findRecord('agendaitem', agendaitem.get('id'), { reload: true });
    itemToDelete.set('aboutToDelete', true);
    // await itemToDelete.belongsTo('subcase').reload(); 
    const agendaActivity = await itemToDelete.get('agendaActivity');

    if (agendaActivity) {
      const subcase = await agendaActivity.get('subcase');
      // await subcase.hasMany('agendaitems').reload();
      const agendaitemsFromActivity = await agendaActivity.get('agendaitems');
      if (agendaitemsFromActivity.length == 1) {
        // if only 1 item is found, the activity should be destroyed and the subcase updated before deleting the agendaitem
        if (subcase) { //TODO KAS-1425 this if should not be needed !
          await subcase.set('requestedForMeeting', null);
          await subcase.set('consulationRequests', []); // TODO KAS-1425 do we still need this ?
          await subcase.save();
        }
        await agendaActivity.destroyRecord();
        await subcase.hasMany('agendaActivity').reload();
      } else {
        const foundAgendaitem = agendaitemsFromActivity.find((agendaitem) => agendaitem.id == itemToDelete.id);
        itemToDelete = foundAgendaitem;
      }
    }
    await itemToDelete.destroyRecord();
  },

  // TODO KAS-1425
  async deleteAgendaitemFromMeeting(agendaitem) {
    debugger;
    let itemToDelete = await this.store.findRecord('agendaitem', agendaitem.get('id'), { reload: true });
    // const currentAgenda = await itemToDelete.get('agenda');
    // const currentMeeting = await currentAgenda.get('createdFor');
    // const currentMeetingId = await currentMeeting.get('id');
    if (this.currentSession.isAdmin) {
      itemToDelete.set('aboutToDelete', true);
      const agendaActivity = await itemToDelete.get('agendaActivity');

      if (agendaActivity) {
        // if an activity exists, it should always have 1 subcase and at least 1 agendaitems
        const subcase = await agendaActivity.get('subcase');
        const agendaitems = await agendaActivity.get('agendaitems');
        // We should no longer have to verify the meeting since the agenitems from 1 activity should only ever belong to 1 meeting
        await Promise.all(agendaitems.map(async item => {
          // const agenda = await item.get('agenda');
          // const meeting = await agenda.get('createdFor');
          // const meetingId = await meeting.get('id');
          // if (meetingId === currentMeetingId) {
            await item.destroyRecord();
          // }
        }));
        await agendaActivity.destroyRecord();
        await subcase.set('requestedForMeeting', null);
        await subcase.save();
        await subcase.hasMany('agendaActivity').reload();
        // await subcase.hasMany('agendaitems').reload();
        // const agendaitemsFromSubcase = await subcase.get('agendaitems');
        // if (agendaitemsFromSubcase.length == 0) {
        //   const phases = await subcase.get('phases');
        //   await Promise.all(phases.map(async phase => {
        //     await phase.destroyRecord();
        //   }));
        // }
        // await subcase.set('requestedForMeeting', null);
        // await subcase.save();
      } else {
        await itemToDelete.destroyRecord(); // TODO KAS-1425 This could only happen on legacy data or when the get of activity fails ? ??
      }

    } else {
      this.toaster.error(this.intl.t('action-not-allowed'), this.intl.t('warning-title'));
    }
  },

  async retrieveModifiedDateFromNota(agendaItem) {
    const newsletterInfoForSubcase = await agendaItem.get('subcase.newsletterInfo');
    const nota = await agendaItem.get('nota');
    if (!nota) {
      return null;
    }

    const documentVersion = await nota.get('lastDocumentVersion');
    const modifiedDateFromMostRecentlyAddedNotaDocumentVersion = documentVersion.created;
    const notaDocumentVersions = await nota.get('documentVersions');
    if (notaDocumentVersions.length > 1) {
      const newsletterInfoOnSubcaseLastModifiedTime = newsletterInfoForSubcase.modified;
      if (newsletterInfoOnSubcaseLastModifiedTime) {
        if (moment(newsletterInfoOnSubcaseLastModifiedTime).isBefore(moment(modifiedDateFromMostRecentlyAddedNotaDocumentVersion))) {
          return moment(modifiedDateFromMostRecentlyAddedNotaDocumentVersion);
        } else {
          return null;
        }
      } else {
        return moment(modifiedDateFromMostRecentlyAddedNotaDocumentVersion);
      }
    }
    return null;
  }
});
