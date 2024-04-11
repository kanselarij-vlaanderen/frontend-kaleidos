import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';

export default class SubcaseBekrachtigingDescriptionPanelView extends Component {
  /**
   * @argument subcase
   * @argument onClickEdit
   */
  @service store;
  @service currentSession;
  @service subcasesService;

  @tracked comments = [];
  @tracked subcaseType = null;
  @tracked latestMeeting = null;
  @tracked latestAgenda = null;
  @tracked latestAgendaitem = null;
  @tracked latestDecisionActivity = null;
  @tracked approved = null;

  constructor() {
    super(...arguments);
    this.loadAgendaData.perform();
    this.loadComments.perform();
  }

  loadComments = task(async () => {
    const retrievedPieces = await this.store.queryAll('retrieved-piece', {
      'filter[parliament-retrieval-activity][generated-subcase][:id:]':
        this.args.subcase.id,
    });
    if (!retrievedPieces) {
      this.comments =  [];
    } else {
      this.comments = retrievedPieces
        .map((piece) => piece.comment)
        .filter((comment) => comment?.length);
    }
  });

  get canShowDecisionStatus() {
    return (
      this.isFinalMeeting &&
      (this.currentSession.may('view-decisions-before-release') ||
        this.latestMeeting?.internalDecisionPublicationActivity?.get(
          'startDate'
        ))
    );
  }

  get isFinalMeeting() {
    return isPresent(this.latestMeeting?.agenda?.get('id'));
  }

  @task
  *loadAgendaData() {
    this.subcaseType = yield this.args.subcase.type;
    const agendaActivities = yield this.args.subcase
      .hasMany('agendaActivities')
      .reload();
    const sortedAgendaActivities = agendaActivities
      ?.slice()
      ?.sort((a1, a2) => a1.startDate - a2.startDate);

    for (const [index, agendaActivity] of sortedAgendaActivities
      .slice()
      .entries()) {
      // load models for linkTo and other uses
      const agendaitem = yield this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': agendaActivity.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });
      const agenda = yield agendaitem.agenda;
      const meeting = yield agenda.createdFor;
      yield meeting?.kind;
      const decisionPublicationActivity = yield meeting
        .belongsTo('internalDecisionPublicationActivity')
        .reload();
      yield decisionPublicationActivity?.status; // used in get-functions above
      // load decisionActivity
      // agenda-activities are propagated by yggdrail on agenda approval, treatments/decision-activities only when decisions are released
      const treatment = yield agendaitem?.treatment;
      const decisionActivity = yield treatment?.decisionActivity;
      yield decisionActivity?.decisionResultCode;
      // Other profiles should not have the latest decision when decisions have not been released yet
      if (decisionActivity) {
        // the last decision might be null, keep only the last one that exists
        this.latestDecisionActivity = decisionActivity;
      }

      // we need this multiple times in the template and navigating the nested array each time is bothersome
      if (index === agendaActivities.length - 1) {
        this.latestMeeting = meeting;
      }
    }
  }
}
