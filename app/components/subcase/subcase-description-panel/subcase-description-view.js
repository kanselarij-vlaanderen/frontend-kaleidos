import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SubcaseDescriptionView extends Component {
  /**
   * @argument subcase
   * @argument onClickEdit
   */
  @service store;
  @service currentSession;
  @service subcasesService;
  @service subcaseIsApproved;

  @tracked phases = null;
  @tracked subcaseType = null;
  @tracked latestMeeting = null;
  @tracked latestAgenda = null;
  @tracked latestAgendaitem = null;
  @tracked latestDecisionActivity = null;
  @tracked approved = null;
  @tracked modelsOfMeetings = [];

  constructor() {
    super(...arguments);
    this.loadAgendaData.perform();
  }

  get showNotYetRequestedMessage() {
    return ![CONSTANTS.SUBCASE_TYPES.BEKRACHTIGING].includes(this.subcaseType?.uri);
  }

  @task
  *loadAgendaData() {
    this.phases = yield this.subcasesService.getSubcasePhases(this.args.subcase);
    this.subcaseType = yield this.args.subcase.type;
    const agendaActivities = yield this.args.subcase.hasMany('agendaActivities').reload();
    const sortedAgendaActivities = agendaActivities?.sortBy('startDate');
    // const decisionActivities = yield this.args.subcase.hasMany('decisionActivities').reload();
    // const sortedDecisionActivities = decisionActivities?.sortBy('startDate');

    this.modelsOfMeetings = [];
    for (const [index, agendaActivity] of sortedAgendaActivities.toArray().entries()) {
      // load models for linkTo and other uses
      const agendaitem = yield this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': agendaActivity.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });
      const agenda = yield agendaitem.agenda;
      const meeting = yield agenda.createdFor;
      yield meeting?.kind;
      // load decisionActivity
      // agenda-activities are propagated by yggdrail on agenda approval, treatments/decision-activities only when decisions are released
      const treatment = yield agendaitem?.treatment;
      const decisionActivity = yield treatment?.decisionActivity;
      const resultCode = yield decisionActivity?.decisionResultCode;
      // Other profiles should not have the latest decision when decisions have not been released yet
      if (decisionActivity) {
        // the last decision might be null, keep only the last one that exists
        this.latestDecisionActivity = decisionActivity;
      }

      this.modelsOfMeetings.push([meeting, agenda, agendaitem, resultCode]);
      // we need this multiple times in the template and navigating the nested array each time is bothersome
      if (index === agendaActivities.length -1) {
        this.latestMeeting = meeting;
      }

    }
    // TODO KAS-3612 could change to resultCode.isApproved or resultCode.isNoticeTaken
    this.approved = yield this.subcaseIsApproved.isApproved(this.args.subcase);
  }
}
