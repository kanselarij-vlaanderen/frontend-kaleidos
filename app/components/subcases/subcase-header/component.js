import Component from '@ember/component';
import {inject} from '@ember/service';
import {computed} from '@ember/object';
import moment from 'moment';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
  store: inject(),
  agendaService: inject(),
  router: inject(),
  classNames: ["vlc-page-header"],
  isAssigningToOtherAgenda: false,
  isShowingOptions: false,
  isLoading: false,

  canPropose: computed('subcase.{requestedForMeeting,hasAgendaItem,isPostponed}', 'isAssigningToOtherAgenda', async function () {
    const {isAssigningToOtherAgenda, isLoading} = this;
    const subcase = await this.get('subcase');
    const requestedForMeeting = await subcase.get('requestedForMeeting');
    const hasAgendaItem = await subcase.get('hasAgendaItem');

    if (hasAgendaItem || requestedForMeeting || isAssigningToOtherAgenda || isLoading) {
      return false;
    }

    return true;
  }),

  canDelete: computed('canPropose', 'isAssigningToOtherAgenda', async function () {
    const canPropose = await this.get('canPropose');
    const {isAssigningToOtherAgenda} = this;

    if (canPropose && !isAssigningToOtherAgenda) {
      return true;
    }

    return false;
  }),

  meetings: computed('store', function () {
    const dateOfToday = moment().utc().subtract(1, 'weeks').format();
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
    const itemToDelete = await this.store.findRecord('subcase', subcase.get('id'), {reload: true});
    const newsletterInfo = await itemToDelete.get('newsletterInfo');
    if (newsletterInfo) {
      await newsletterInfo.destroyRecord();
    }
    await itemToDelete.destroyRecord();
  },

  navigateToSubcaseOverview(caze) {
    this.router.transitionTo('cases.case.subcases', caze.id);
  },

  toggleAllPropertiesBackToDefault() {
    this.set('isAssigningToOtherAgenda', false);
    this.set('isDeletingSubcase', false);
    this.set('selectedSubcase', null);
    this.set('subcaseToDelete', null);
    this.set('isLoading', false);
  },

  actions: {
    cancel() {
      this.toggleAllPropertiesBackToDefault();
    },

    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },

    requestDeleteSubcase(subcase) {
      this.set('isDeletingSubcase', true);
      this.set('subcaseToDelete', subcase);
    },

    proposeForOtherAgenda(subcase) {
      this.toggleProperty('isAssigningToOtherAgenda');
      this.set('selectedSubcase', subcase);
    },

    async proposeForAgenda(subcase, meeting) {
      this.set('isLoading', true);
      const meetingRecord = await this.store.findRecord('meeting', meeting.get('id'));
      const designAgenda = await this.store.findRecord('agenda', (await meetingRecord.get('latestAgenda')).get('id'));
      await designAgenda.reload(); //ensures latest state is pulled
      if (designAgenda.get('name') === "Ontwerpagenda") {
        await this.get('agendaService').createNewAgendaItem(designAgenda, subcase);
      }
      await subcase.hasMany('agendaitems').reload();
      this.toggleAllPropertiesBackToDefault();
    },

    async deleteSubcase() {
      this.set('isLoading', true);
      const subcaseToDelete = await this.get('subcaseToDelete');
      const caze = await subcaseToDelete.get('case');

      subcaseToDelete.hasMany('agendaitems').reload();
      const agendaitems = await subcaseToDelete.get('agendaitems');

      if (agendaitems && agendaitems.length > 0) {
        return;
      } else {
        await this.deleteSubcase(subcaseToDelete);
      }
      this.navigateToSubcaseOverview(caze);
    },
  },
});
