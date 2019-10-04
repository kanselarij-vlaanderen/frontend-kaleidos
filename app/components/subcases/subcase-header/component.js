import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';

export default Component.extend(ModifiedMixin, {
  store: inject(),
  agendaService: inject(),
  classNames: ["vlc-page-header"],
  isAssigningToAgenda: false,
  isShowingOptions: false,

  meetings: computed('store', function() {
    const dateOfToday = moment().utc().format();
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

  actions: {
    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },

    async proposeForAgenda(subcase, meeting) {
      const meetingRecord = await this.store.findRecord('meeting', meeting.get('id'));
      const designAgenda = await this.store.findRecord('agenda', (await meetingRecord.get('latestAgenda')).get('id'));
      await designAgenda.reload(); //ensures latest state is pulled
      if (designAgenda.get('name') === "Ontwerpagenda") {
        await this.get('agendaService').createNewAgendaItem(designAgenda, subcase);
        await this.updateModifiedProperty(designAgenda);
      }
    },
    proposeForOtherAgenda(subcase) {
      this.toggleProperty('isAssigningToAgenda');
      this.set('selectedSubcase', subcase);
    },

    async unPropose(subcase) {
      const phases = await subcase.get('phases');

      await Promise.all(phases.filter(async phase => {
        const code = await phase.get('code');
        if (!code || code.get('label') == "Ingediend voor agendering") {
          await phase.destroyRecord();
        } else {
          return phase;
        }
      }))
      subcase.set('requestedForMeeting', null);

      subcase.save();
    },

    cancel() {
      this.toggleProperty('isAssigningToAgenda');
      this.set('selectedSubcase', null);
    },

    async archiveSubcase(subcase) {
      const agendaitems = await subcase.get('agendaitems');
      if (!agendaitems) {
        subcase.set('isArchived', true);
        subcase.save();
      }
      this.set('isArchivingSubcase', false);
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
    requestArchiveSubcase() {
      this.set('isArchivingSubcase', true);
    },
    cancelArchiveSubcase() {
      this.set('isArchivingSubcase', false);
    }
  },
});
