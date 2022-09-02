import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import moment from 'moment';

/*
 * @argument subcase
 * @argument onMoveSubcase: from args, the parent route subcases needs to be refreshed after subcase is moved/deleted
 */
export default class SubcasesSubcaseHeaderComponent extends Component {
  @service store;
  @service agendaService;
  @service router;
  @service currentSession;

  @tracked isAssigningToOtherAgenda = false;
  @tracked isAssigningToOtherCase = false;
  @tracked promptDeleteCase = false;
  @tracked isDeletingSubcase = false;
  @tracked isShowingOptions = false;
  @tracked isLoading = false;
  @tracked isAssigning = false;
  @tracked caseToDelete = null;
  @tracked subcaseToDelete = null;
  @tracked canPropose = false;
  @tracked canDelete = false;
  @tracked meetings;

  constructor() {
    super(...arguments);

    this.loadData.perform();
  }

  @task
  *loadData() {
    const meeting = yield this.args.subcase.requestedForMeeting;
    const activities = yield this.args.subcase.agendaActivities;

    this.canPropose = !(activities?.length || meeting || this.isAssigningToOtherAgenda || this.isLoading);
    this.canDelete = (this.canPropose && !this.isAssigningToOtherAgenda);

    const dateOfToday = moment().utc()
      .subtract(1, 'weeks')
      .format();
    const futureDate = moment().utc()
      .add(20, 'weeks')
      .format();

    this.meetings = yield this.store.query('meeting', {
      filter: {
        ':gte:planned-start': dateOfToday,
        ':lte:planned-start': futureDate,
        'is-final': false,
      },
      sort: 'planned-start',
    });
  }

  triggerDeleteCaseDialog() {
    this.promptDeleteCase = true;
  }

  navigateToSubcaseOverview(dmf) {
    this.router.transitionTo('cases.case.subcases', dmf.id);
  }

  toggleAllPropertiesBackToDefault() {
    this.isAssigningToOtherAgenda = false;
    this.isDeletingSubcase = false;
    this.selectedSubcase = null;
    this.subcaseToDelete = null;
    this.isLoading = false;
    this.isAssigningToOtherCase = false;
  }

  // TODO KAS-3256 We should take another look of the deleting case feature in light of publications also using cases.
  @task
  *deleteCase(_case) {
    const dmf = yield _case.decisionmakingFlow;
    yield _case.destroyRecord();
    yield dmf.destroyRecord();
    this.promptDeleteCase = false;
    this.caseToDelete = null;
    this.router.transitionTo('cases');
  }

  @action
  cancel() {
    this.toggleAllPropertiesBackToDefault();
  }

  @action
  showMultipleOptions() {
    this.isShowingOptions = !this.isShowingOptions;
  }

  @action
  requestDeleteSubcase(subcase) {
    this.isDeletingSubcase = true;
    this.subcaseToDelete = subcase;
  }

  @action
  proposeForOtherAgenda(subcase) {
    this.isAssigningToOtherAgenda = !this.isAssigningToOtherAgenda;
    this.selectedSubcase = subcase;
  }

  @action
  async proposeForAgenda(subcase, meeting) {
    this.isLoading = true;
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
    this.loadData.perform();
  }

  @action
  async deleteSubcase() {
    this.isLoading = true;
    const subcaseToDelete = await this.subcaseToDelete;
    const dmf = await subcaseToDelete.decisionmakingFlow;

    subcaseToDelete.hasMany('agendaActivities').reload();
    const agendaActivities = await subcaseToDelete.agendaActivities;

    if (agendaActivities?.length > 0) {
      return;
    }

    const itemToDelete = await this.store.findRecord('subcase', subcaseToDelete.id, {
      reload: true,
    });
    const newsletterInfo = await itemToDelete.newsletterInfo;
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

    this.navigateToSubcaseOverview(dmf);
    this.args.onMoveSubcase();
  }

  @action
  cancelDeleteSubcase() {
    this.isDeletingSubcase = false;
  }

  @action
  triggerMoveSubcaseDialog() {
    this.isAssigningToOtherCase = true;
  }

  @action
  async moveSubcase(newCase) {
    const newDMF = await this.store.queryOne('decisionmaking-flow', {
      filter: {
        case: {
          ':id:': newCase.id,
        },
      },
    });

    const oldDMF = await this.args.subcase.decisionmakingFlow;
    this.args.subcase.decisionmakingFlow = newDMF;
    await this.args.subcase.save();
    this.isAssigningToOtherCase = false;

    const subCases = await oldDMF.hasMany('subcases').reload();
    if (subCases.length === 0) {
      const oldCase = await oldDMF.case;
      const publicationFlow = await this.store.queryOne('publication-flow', {
        'filter[case][:id:]': oldCase.id,
      });
      // TODO KAS-3315 The deletion of case is only possible in this situation
      if (!publicationFlow) {
        this.caseToDelete = oldCase;
        this.triggerDeleteCaseDialog();
        return;
      }
    }
    this.router.transitionTo('cases.case.subcases');
    this.args.onMoveSubcase();
  }

  @action
  cancelDeleteCase() {
    this.promptDeleteCase = false;
    this.caseToDelete = null;
    this.router.transitionTo('cases.case.subcases');
  }
}
