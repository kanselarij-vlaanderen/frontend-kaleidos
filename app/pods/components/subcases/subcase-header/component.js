import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import moment from 'moment';

export default Component.extend({
  store: inject(),
  agendaService: inject(),
  router: inject(),
  currentSession: inject(),
  classNames: ['vlc-page-header'],
  isAssigningToOtherAgenda: false,
  isAssigningToOtherCase: false,
  promptDeleteCase: false,
  isShowingOptions: false,
  isLoading: false,
  isAssigning: false,
  subcase: null,
  caseToDelete: null,

  canPropose: computed('subcase.{requestedForMeeting,hasActivity}', 'isAssigningToOtherAgenda', async function() {
    const {
      isAssigningToOtherAgenda, isLoading,
    } = this;
    const {
      subcase,
    } = this;
    const requestedForMeeting = await subcase.get('requestedForMeeting');
    const hasActivity = await subcase.get('hasActivity');

    if (hasActivity || requestedForMeeting || isAssigningToOtherAgenda || isLoading) {
      return false;
    }

    return true;
  }),

  canDelete: computed('canPropose', 'isAssigningToOtherAgenda', async function() {
    const canPropose = await this.get('canPropose');
    const {
      isAssigningToOtherAgenda,
    } = this;

    if (canPropose && !isAssigningToOtherAgenda) {
      return true;
    }

    return false;
  }),

  meetings: computed('store', function() {
    const dateOfToday = moment().utc()
      .subtract(1, 'weeks')
      .format();
    const futureDate = moment().utc()
      .add(6, 'weeks')
      .format();

    return this.store.query('meeting', {
      filter: {
        ':gte:planned-start': dateOfToday,
        ':lte:planned-start': futureDate,
        'is-final': false,
      },
      sort: 'planned-start',
    });
  }),

  async deleteSubcase(subcase) {
    const itemToDelete = await this.store.findRecord('subcase', subcase.get('id'), {
      reload: true,
    });
    const newsletterInfo = await itemToDelete.get('newsletterInfo');
    if (newsletterInfo) {
      await newsletterInfo.destroyRecord();
    }
    await itemToDelete.destroyRecord();
  },

  triggerDeleteCaseDialog() {
    this.set('promptDeleteCase', true);
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
    this.set('isAssigningToOtherCase', false);
  },

  deleteCase: task(function *(_case) {
    yield _case.destroyRecord();
    this.set('promptDeleteCase', false);
    this.set('caseToDelete', null);
    this.get('router').transitionTo('cases');
  }),

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
      const meetingFromStore = await this.store.findRecord('meeting', meeting.get('id'));
      const designAgenda = await this.store.findRecord('agenda', (await meetingFromStore.get('latestAgenda')).get('id'));
      // ensures latest state is pulled
      await designAgenda.reload();
      await designAgenda.belongsTo('status').reload();
      const isDesignAgenda = designAgenda.get('isDesignAgenda');
      if (isDesignAgenda) {
        await this.get('agendaService').createNewAgendaitem(designAgenda, subcase);
      }
      this.toggleAllPropertiesBackToDefault();
    },

    async deleteSubcase() {
      this.set('isLoading', true);
      const subcaseToDelete = await this.get('subcaseToDelete');
      const caze = await subcaseToDelete.get('case');

      subcaseToDelete.hasMany('agendaActivities').reload();
      const agendaActivities = await subcaseToDelete.get('agendaActivities');

      if (agendaActivities && agendaActivities.length > 0) {
        return;
      }
      await this.deleteSubcase(subcaseToDelete);

      this.navigateToSubcaseOverview(caze);
    },
    cancelDeleteSubcase() {
      this.set('isDeletingSubcase', false);
    },

    triggerMoveSubcaseDialog() {
      this.set('isAssigningToOtherCase', true);
    },
    async moveSubcase(newCase) {
      const edCase = await this.store.findRecord('case', newCase.id); // ensure we have an ember-data case

      const oldCase = await this.subcase.get('case');
      this.subcase.set('case', edCase);
      await this.subcase.save();
      this.set('isAssigningToOtherCase', false);

      const subCases = await oldCase.hasMany('subcases').reload();
      if (subCases.length > 0) {
        this.get('router').transitionTo('cases.case.subcases');
      } else {
        this.set('caseToDelete', oldCase);
        this.triggerDeleteCaseDialog();
      }
    },

    cancelDeleteCase() {
      this.set('promptDeleteCase', false);
      this.set('caseToDelete', null);
      this.get('router').transitionTo('cases.case.subcases');
    },
  },
});
