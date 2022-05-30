// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import moment from 'moment';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  store: inject(),
  agendaService: inject(),
  router: inject(),
  currentSession: inject(),
  isAssigningToOtherAgenda: false,
  isAssigningToOtherCase: false,
  promptDeleteCase: false,
  isShowingOptions: false,
  isLoading: false,
  isAssigning: false,
  subcase: null,
  caseToDelete: null,
  onMoveSubcase: null, // from args, the parent route subcases needs to be refreshed after subcase is moved/deleted

  canPropose: computed('subcase.{requestedForMeeting,agendaActivities}', 'isAssigningToOtherAgenda', async function() {
    const {
      isAssigningToOtherAgenda, isLoading,
    } = this;
    const {
      subcase,
    } = this;
    const requestedForMeeting = await subcase.get('requestedForMeeting');
    const activities = await subcase.get('agendaActivities');

    if (activities?.legnth || requestedForMeeting || isAssigningToOtherAgenda || isLoading) {
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
      .add(20, 'weeks')
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
    /*
    In v3.26.x, we used to call `await itemToDelete.destroyRecord();` here
    In theory, destroyRecord() is the same as deleteRecord() followed by save(). Problem is, in the tests that's not the case.
    The test `integration/all-flaky-tests/subcase.spec.js#should add a subcase and then delete it` would fail with the following exception thrown by Ember:
    > Assertion Failed: Attempted to access the computed <(unknown):ember461>.isTruthy on a destroyed object, which is not allowed
    After replacing the call to destroyRecord() with deleteRecord() & save(), the test would pass on v3.28.8
    */
    itemToDelete.deleteRecord();
    await itemToDelete.save();
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

  // TODO KAS-3256 We should take another look of the deleting case feature in light of publications also using cases.
  deleteCase: task(function *(_case) {
    yield _case.destroyRecord();
    this.set('promptDeleteCase', false);
    this.set('caseToDelete', null);
    this.get('router').transitionTo('cases');
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
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
      let submissionActivities = await this.store.query('submission-activity', {
        'filter[subcase][:id:]': subcase.id,
        'filter[:has-no:agenda-activity]': true,
      });
      submissionActivities = submissionActivities.toArray();
      if (!submissionActivities.length) {
        const now = new Date();
        const submissionActivity = this.store.createRecord('submission-activity', {
          startDate: now,
          subcase,
        });
        await submissionActivity.save();
        submissionActivities = [submissionActivity];
      }
      await this.agendaService.putSubmissionOnAgenda(meeting, submissionActivities);
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
      this.onMoveSubcase();
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
      if (subCases.length === 0) {
        const publicationFlow = await this.store.queryOne('publication-flow', {
          'filter[case][:id:]': oldCase.id,
        });
        // TODO KAS-3315 The deletion of case is only possible in this situation
        if (!publicationFlow) {
          this.set('caseToDelete', oldCase);
          this.triggerDeleteCaseDialog();
          return;
        }
      }
      this.router.transitionTo('cases.case.subcases');
      this.onMoveSubcase();
    },

    cancelDeleteCase() {
      this.set('promptDeleteCase', false);
      this.set('caseToDelete', null);
      this.get('router').transitionTo('cases.case.subcases');
    },
  },
});
