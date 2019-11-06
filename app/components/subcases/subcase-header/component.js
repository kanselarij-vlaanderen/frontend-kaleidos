import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';

export default Component.extend(ModifiedMixin, {
  store: inject(),
  agendaService: inject(),
  router: inject(),
  classNames: ["vlc-page-header"],
  isAssigningToOtherAgenda: false,
  isShowingOptions: false,
  isAssigning: false,

  meetings: computed('store', function() {
    const dateOfToday = moment().utc().subtract(1,'weeks').format();
    const dateInTwoWeeks = moment().utc().add(6, 'weeks').format();

    return this.store.query('meeting', {
      filter: {
        ':gte:planned-start': dateOfToday,
        ':lte:planned-start': dateInTwoWeeks,
        'is-final': false
      },
      sort: 'planned-start'
    })
  }),

  async deleteSubcase(subcase) {
    const itemToDelete = await this.store.findRecord('subcase', subcase.get('id'), { reload: true });
    const newsletterInfo = await itemToDelete.get('newsletterInfo');
    if(newsletterInfo) {
      await newsletterInfo.destroyRecord();
    }
    await itemToDelete.destroyRecord();
  },

  actions: {
    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },

    async proposeForAgenda(subcase, meeting) {
      this.set('isAssigning', true);
      const meetingRecord = await this.store.findRecord('meeting', meeting.get('id'));
      const designAgenda = await this.store.findRecord('agenda', (await meetingRecord.get('latestAgenda')).get('id'));
      await designAgenda.reload(); //ensures latest state is pulled
      if (designAgenda.get('name') === "Ontwerpagenda") {
        await this.get('agendaService').createNewAgendaItem(designAgenda, subcase);
      }
      this.set('isAssigning', false);
    },
    proposeForOtherAgenda(subcase) {
      this.toggleProperty('isAssigningToOtherAgenda');
      this.set('selectedSubcase', subcase);
    },

    cancel() {
      this.set('isAssigningToOtherAgenda', false);
      this.set('selectedSubcase', null);
    },

    async deleteSubcase(subcase) {
      subcase.hasMany('agendaitems').reload();
      const caze = await subcase.get('case');
      const agendaitems = await subcase.get('agendaitems');
      if (agendaitems && agendaitems.length > 0) {
        return;
      } else {
        await this.deleteSubcase(subcase);
      }
      this.set('isDeletingSubcase', false);
      this.router.transitionTo('cases.case.subcases', caze.id);
    },
    unarchiveSubcase(subcase) {
      subcase.set('isArchived', false);
      subcase.save();
    },
    closeSubcase(subcase) {
      const concluded = subcase.get('concluded');
      subcase.set('concluded', !concluded);
      subcase.save();
    },
    requestDeleteSubcase() {
      this.set('isDeletingSubcase', true);
    },
    cancelDeleteSubcase() {
      this.set('isDeletingSubcase', false);
    }
  },
});
