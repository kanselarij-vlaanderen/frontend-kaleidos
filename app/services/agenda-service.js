import Service, { inject as service } from '@ember/service';

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

  async getDocumentNames(model) {
    return ajax({
      method: 'GET',
      url: `/lazy-loading/documentNames?uuid=${model.id}`,
    }).then((result) => result.body.documentNames);
  },

  async approveAgenda(currentMeeting, agendaToApprove) {
    if (!agendaToApprove) {
      return agendaToApprove;
    }
    // Triggers the agendaApproveService to approve the agenda.
    await ajax({
      method: 'POST',
      url: '/agenda-approve/onlyApprove',
      data: {
        createdForMeetingWithId: currentMeeting.id,
        idOfAgendaToApprove: agendaToApprove.id,
      },
    });
    notifyPropertyChange(agendaToApprove, 'agendaitems');
  },

  async approveAgendaAndCopyToDesignAgenda(currentMeeting, oldAgenda) {
    if (!oldAgenda) {
      return oldAgenda;
    }
    // Use approveagendaService to duoplicate AgendaItems into new agenda.
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

    if (Number.isNaN(priorityToAssign)) {
      priorityToAssign = 1;
    }

    if (index) {
      priorityToAssign += index;
    }

    const agendaActivity = await this.store.createRecord('agenda-activity', {
      startDate: moment().utc()
        .toDate(),
      subcase,
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
      mandatees,
      documentVersions: await subcase.get('documentVersions'),
      linkedDocumentVersions: await subcase.get('linkedDocumentVersions'),
      agendaActivity,
      showInNewsletter: true,
    });
    await agendaitem.save();
    const meeting = await selectedAgenda.get('createdFor');
    await selectedAgenda.hasMany('agendaitems').reload();
    subcase.set('requestedForMeeting', meeting);
    await subcase.hasMany('agendaActivities').reload();
    await subcase.save();
    updateModifiedProperty(selectedAgenda);
  },

  async groupAgendaItemsOnGroupName(agendaitems) {
    let previousAgendaitemGroupName;
    return Promise.all(
      agendaitems.map(async(item) => {
        let currentAgendaitemGroupName;
        const mandatees = await item.get('sortedMandatees');
        if (item.isApproval) {
          item.set('groupName', null);
          item.set('ownGroupName', null);
          return;
        }
        if (mandatees.length === 0) {
          item.set('groupName', 'Geen toegekende ministers');
          currentAgendaitemGroupName = 'Geen toegekende ministers';
        } else {
          currentAgendaitemGroupName = mandatees
            .map((mandatee) => mandatee.title)
            .join('<br/>');
        }

        if (currentAgendaitemGroupName !== previousAgendaitemGroupName) {
          previousAgendaitemGroupName = currentAgendaitemGroupName;
          item.set('groupName', currentAgendaitemGroupName);
        } else {
          item.set('groupName', null);
        }
        item.set('ownGroupName', currentAgendaitemGroupName);
      })
    );
  },

  async deleteAgendaitem(agendaitem) {
    const itemToDelete = await this.store.findRecord('agendaitem', agendaitem.get('id'), {
      reload: true,
    });
    itemToDelete.set('aboutToDelete', true);
    const agendaActivity = await itemToDelete.get('agendaActivity');

    if (agendaActivity) {
      const subcase = await agendaActivity.get('subcase');
      await agendaActivity.hasMany('agendaitems').reload();
      const agendaitemsFromActivity = await agendaActivity.get('agendaitems');
      await Promise.all(agendaitemsFromActivity.map(async(agendaitem) => {
        const agenda = await agendaitem.get('agenda');
        await agendaitem.destroyRecord();
        await agenda.hasMany('agendaitems').reload();
      }));
      await agendaActivity.destroyRecord();
      await subcase.set('requestedForMeeting', null);
      await subcase.save();
      await subcase.hasMany('agendaActivities').reload();
    } else {
      await itemToDelete.destroyRecord();
    }
  },

  async deleteAgendaitemFromMeeting(agendaitem) {
    if (this.currentSession.isAdmin) {
      return await this.deleteAgendaitem(agendaitem);
    }
    this.toaster.error(this.intl.t('action-not-allowed'), this.intl.t('warning-title'));
  },

  async retrieveModifiedDateFromNota(agendaitem, subcase) {
    if (!subcase) {
      return null;
    }
    const nota = await agendaitem.get('nota');
    if (!nota) {
      return null;
    }
    const newsletterInfoForSubcase = await subcase.get('newsletterInfo');
    const documentVersion = await nota.get('lastDocumentVersion');
    const modifiedDateFromMostRecentlyAddedNotaDocumentVersion = documentVersion.created;
    const notaDocumentVersions = await nota.get('documentVersions');
    if (notaDocumentVersions.length > 1) {
      const newsletterInfoOnSubcaseLastModifiedTime = newsletterInfoForSubcase.modified;
      if (newsletterInfoOnSubcaseLastModifiedTime) {
        if (moment(newsletterInfoOnSubcaseLastModifiedTime)
          .isBefore(moment(modifiedDateFromMostRecentlyAddedNotaDocumentVersion))) {
          return moment(modifiedDateFromMostRecentlyAddedNotaDocumentVersion);
        }
        return null;
      }
      return moment(modifiedDateFromMostRecentlyAddedNotaDocumentVersion);
    }
    return null;
  },
});
