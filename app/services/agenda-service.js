import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';
import { notifyPropertyChange } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import EmberObject from '@ember/object';

export default Service.extend(ModifiedMixin,isAuthenticatedMixin, {
  store: inject(),
  globalError: inject(),
  intl: inject(),
  addedDocuments: null,
  addedAgendaitems: null,

  assignNewSessionNumbers() {
    return $.ajax({
      method: 'GET',
      url: `/session-service/assignNewSessionNumbers`,
    });
  },

  getClosestMeetingAndAgendaId(date) {
    return $.ajax({
      method: 'GET',
      url: `/session-service/closestMeeting?date=${date}`,
    }).then((result) => {
      return result.body.closestMeeting;
    });
  },

  getActiveAgendas(date) {
    return $.ajax({
      method: 'GET',
      url: `/session-service/activeAgendas?date=${date}`,
    }).then((result) => {
      return result.body.agendas;
    });
  },

  approveAgendaAndCopyToDesignAgenda(currentSession, oldAgenda) {
    let newAgenda = this.store.createRecord('agenda', {
      name: 'Ontwerpagenda',
      createdFor: currentSession,
      created: moment()
        .utc()
        .toDate(),
      modified: moment()
        .utc()
        .toDate(),
    });

    return newAgenda
      .save()
      .then((agenda) => {
        if (oldAgenda) {
          return $.ajax({
            method: 'POST',
            url: '/agenda-approve/approveAgenda',
            data: {
              newAgendaId: agenda.id,
              oldAgendaId: oldAgenda.id,
            },
          });
        } else {
          notifyPropertyChange(agenda, 'agendaitems');
          return agenda;
        }
      })
      .then(() => {
        notifyPropertyChange(newAgenda, 'agendaitems');
        return newAgenda;
      });
  },

  agendaWithChanges(currentAgendaID, agendaToCompareID) {
    return $.ajax({
      method: 'GET',
      url: `/agenda-sort/agenda-with-changes?agendaToCompare=${agendaToCompareID}&selectedAgenda=${currentAgendaID}`,
    })
      .then((result) => {
        this.set('addedDocuments', result.addedDocuments);
        this.set('addedAgendaitems', result.addedAgendaitems);
        return result;
      })
      .catch(() => {

      });
  },

  async createNewAgendaItem(selectedAgenda, subcase, index) {
    await selectedAgenda.hasMany("agendaitems").reload();
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
    const agendaitem = this.store.createRecord('agendaitem', {
      retracted: false,
      titlePress: subcase.get('shortTitle'),
      textPress: pressText,
      created: moment()
        .utc()
        .toDate(),
      subcase: subcase,
      priority: priorityToAssign,
      agenda: selectedAgenda,
      title: subcase.get('title'),
      shortTitle: subcase.get('shortTitle'),
      formallyOk: CONFIG.notYetFormallyOk,
      showAsRemark: isAnnouncement,
      mandatees: mandatees,
      documentVersions: await subcase.get('documentVersions'),
      linkedDocumentVersions: await subcase.get('linkedDocumentVersions'),
      themes: await subcase.get('themes'),
      approvals: await subcase.get('approvals'),
    });
    await agendaitem.save();

    const meeting = await selectedAgenda.get('createdFor');
    await subcase.hasMany('agendaitems').reload();
    subcase.set('requestedForMeeting', meeting);
    await subcase.save();
    await this.assignSubcasePhase(subcase);
    await subcase.hasMany('phases').reload();

    await selectedAgenda.hasMany("agendaitems").reload();
    await this.updateModifiedProperty(selectedAgenda);
  },

  async assignSubcasePhase(subcase) {
    const phasesCodes = await this.store.query('subcase-phase-code', { filter: { label: 'Ingediend voor agendering' } });
    const phaseCode = phasesCodes.get('firstObject');
    if (phaseCode) {
      const phase = this.store.createRecord('subcase-phase', {
        date: moment().utc().toDate(),
        code: phaseCode,
        subcase: subcase
      });
      await phase.save();
    }
  },

  async groupAgendaItemsOnGroupName(agendaitems) {
    let previousAgendaitemGroupName;
    return Promise.all(
      agendaitems.map(async (item) => {
        const mandatees = await item.get('sortedMandatees');
        if (item.isApproval) {
          item.set('groupName', null);
          item.set('ownGroupName', null)
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

  async deleteAgendaitem(agendaitem) {
    let itemToDelete = await this.store.findRecord('agendaitem', agendaitem.get('id'), { reload: true });
    await itemToDelete.belongsTo('subcase').reload();
    const subcase = await itemToDelete.get('subcase');

    if (subcase) {
      await subcase.hasMany('agendaitems').reload();
      const agendaitemsFromSubcase = await subcase.get('agendaitems');
      if(agendaitemsFromSubcase.length == 1) {
        // if only 1 item is found, all phases should be destroyed and the subcase updated before deleting the agendaitem
        const phases = await subcase.get('phases');
        await Promise.all(phases.map(async phase => {
          await phase.destroyRecord();
        }));
        await subcase.set('requestedForMeeting', null);
        await subcase.set('consulationRequests', []);
        await subcase.set('agendaitems', []);
        await subcase.save();
      }else {
        const foundAgendaitem = agendaitemsFromSubcase.find((agendaitem) => agendaitem.id == itemToDelete.id);
        itemToDelete = foundAgendaitem;
      }
    }
    await itemToDelete.destroyRecord();
  },

  async deleteAgendaitemFromMeeting(agendaitem, currentMeetingId) {
    let itemToDelete = await this.store.findRecord('agendaitem', agendaitem.get('id'), { reload: true });
    if(this.isAdmin) {
      const subcase = await itemToDelete.get('subcase');
      const agendaitems = await subcase.get('agendaitems');

      if(subcase){
        await Promise.all(agendaitems.map(async item => { 
          const agenda = await item.get('agenda');
          const meeting = await agenda.get('createdFor');
          const meetingId = await meeting.get('id');
          if(meetingId === currentMeetingId) {
            await item.destroyRecord();
          }
        }));
        await subcase.hasMany('agendaitems').reload();
        const agendaitemsFromSubcase = await subcase.get('agendaitems');
        if(agendaitemsFromSubcase.length == 0) {
          const phases = await subcase.get('phases');
          await Promise.all(phases.map(async phase => {
            await phase.destroyRecord();
          }));
        }
        await subcase.set('requestedForMeeting', null);
        await subcase.save();
      } else {
        await itemToDelete.destroyRecord();
      }

    } else {
      this.globalError.showToast.perform(EmberObject.create({
        title: this.intl.t('warning-title'),
        message: this.intl.t('action-not-allowed'),
        type: 'error'
      }));
    }
  }
});
