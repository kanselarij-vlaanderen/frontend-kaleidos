import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
  store: inject(),
  sessionService: inject(),
  agendaService: inject(),
  currentAgenda: null,
  agendaitem: null,
  lastDefiniteAgenda: null,

  currentMeeting: computed('currentAgenda.createdFor', function() {
    return this.currentAgenda.get('createdFor');
  }),

  meetings: computed('currentMeeting', function() {
    const currentMeetingDate = this.currentMeeting.get('plannedStart')
    const dateOfToday = moment(currentMeetingDate).utc().format();
    const dateInTwoWeeks = moment().utc().add(6, 'weeks').format();

    return this.store.query('meeting', {
      filter: {
        ':gt:planned-start': dateOfToday,
        ':lte:planned-start': dateInTwoWeeks,
        'is-final': false
      },
      sort: 'planned-start'
    })
  }),

  isPostPonable: computed('sessionService.agendas.@each', function() {
    return this.get('sessionService.agendas').then(agendas => {
      if (agendas && agendas.get('length') > 1) {
        return true;
      } else {
        return false;
      }
    })
  }),

  isDeletable: computed(
    'agendaitem.{subcase,subcase.agendaitems}',
    'currentAgenda.name',
    async function() {
      const currentAgendaName = await this.get('currentAgenda.name');
      const agendaitemSubcase = await this.get('agendaitem.subcase');
      const agendaitems = await this.get('agendaitem.subcase.agendaitems');
      if (currentAgendaName && currentAgendaName !== "Ontwerpagenda") {
        return false;
      } else if (agendaitemSubcase) {
        if (agendaitems && agendaitems.length > 1) {
          return false
        } else {
          return true;
        }
      } else {
        return true;
      }
    }),

  async deleteItem(agendaitem) {
    const id = agendaitem.get('id')
    await this.agendaService.deleteAgendaitemFromAgenda(agendaitem);
    this.set('sessionService.selectedAgendaItem', null);
    this.refreshRoute(id);
  },

  actions: {
    showOptions() {
      this.toggleProperty('showOptions');
    },

    async postponeAgendaItem(agendaitem, meetingToPostponeTo) {
      agendaitem.set('retracted', true);

      const postPonedObject = this.store.createRecord('postponed', {
        agendaitem: agendaitem,
        meeting: meetingToPostponeTo
      });

      if (meetingToPostponeTo) {
        const subcase = await agendaitem.get('subcase');
        const agenda = await meetingToPostponeTo.get('latestAgenda');
        if (agenda.get('name') == 'Ontwerpagenda' && subcase) {
          await this.agendaService.createNewAgendaItem(agenda, subcase);
        }
      }

      postPonedObject.save().then(postponedTo => {
        agendaitem.set('postponed', postponedTo);
      });

      await agendaitem.save();
      await agendaitem.reload();
      await agendaitem.subcase.reload();
    },

    async advanceAgendaitem() {
      const agendaitem = await this.store.findRecord('agendaitem', this.agendaitem.get('id'));
      if (agendaitem && agendaitem.retracted) {
        agendaitem.set('retracted', false);
      }
      const postponedTo = await agendaitem.get('postponedTo');
      if (agendaitem && postponedTo) {
        await postponedTo.destroyRecord();
      }
      await agendaitem.save();
      await agendaitem.reload();
      await agendaitem.subcase.reload();
    },

    toggleIsVerifying() {
      this.toggleProperty('isVerifying');
    },

    async tryToDeleteItem(agendaitem) {
      if (await this.isDeletable) {
        this.deleteItem(agendaitem);
      } else if (this.isAdmin) {
        this.toggleProperty('isVerifying');
      }
    },

    verifyDelete(agendaitem) {
      this.deleteItem(agendaitem);
    }
  }
});
