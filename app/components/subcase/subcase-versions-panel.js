import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';

export default class SubcaseVersionsPanel extends Component {
  /**
   * @argument subcase
   */
  @service store;
  @service intl;

  @tracked latestDecisionActivity = null;
  @tracked modelsOfMeetings = [];
  @tracked phases;

  constructor() {
    super(...arguments);
    this.loadAgendaData.perform();
    this.loadSubcasePhases.perform();
  }

  @dropTask
  *loadSubcasePhases() {
    const phases = [];
    const sortedAgendaActivities = yield this.store.queryAll('agenda-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      sort: 'start-date',
    });

    for (const activity of sortedAgendaActivities.slice()) {
      // phase 1: Is the subcase on an approved agenda
      const firstAgendaitemOfActivity = yield this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': activity.id,
        'filter[:has-no:previous-version]': 't',
        sort: 'created',
      });
      const treatment = yield firstAgendaitemOfActivity.treatment;
      const decisionActivity = yield treatment?.decisionActivity;
      const agenda = yield firstAgendaitemOfActivity.agenda;
      const meeting = yield agenda.createdFor;
      
      if (decisionActivity) {
        const decisionResultCode = yield decisionActivity.belongsTo('decisionResultCode').reload();
        // legacy subcases might not have a decisionResultCode. In that case we don't show anything in the timeline.
        if (decisionResultCode) {
          phases.push({
            label: `${decisionResultCode.label} ${this.intl.t(
              'decision-activity-result'
              )}`,
              date: meeting.plannedStart,
              agendaitem: firstAgendaitemOfActivity,
              agenda: agenda,
              meeting: meeting
            });
          }
        }
        // phase 2: When was the subcase proposed
        if (activity.startDate) {
          phases.push({
            label: this.intl.t('activity-phase-proposed-for-agenda'),
            date: activity.startDate,
            agendaitem: firstAgendaitemOfActivity,
            agenda: agenda,
            meeting: meeting
          });
        }
        // phase 3: if on approved, what is the decision
        const agendaStatus = yield agenda.belongsTo('status').reload();
        if (!agendaStatus.isDesignAgenda) {
          phases.push({
            label: this.intl.t('activity-phase-approved-on-agenda'),
            date: meeting.plannedStart,
            agendaitem: firstAgendaitemOfActivity,
            agenda: agenda,
            meeting: meeting
          });
      }
    }
    this.phases = phases;
  }

  @task
  *loadAgendaData() {
    const agendaActivities = yield this.args.subcase.hasMany('agendaActivities').reload();
    const sortedAgendaActivities = agendaActivities
      .slice()
      .sort((a1, a2) => a1.startDate - a2.startDate)

    this.modelsOfMeetings = [];
    for (const agendaActivity of sortedAgendaActivities.slice()) {
      // load models for linkTo and other uses
      const agendaitem = yield this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': agendaActivity.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });
      const agenda = yield agendaitem.agenda;
      const meeting = yield agenda.createdFor;
      yield meeting?.kind;
      const decisionPublicationActivity = yield meeting.belongsTo('internalDecisionPublicationActivity').reload();
      yield decisionPublicationActivity?.status; // used in get-functions above
      // load decisionActivity
      // agenda-activities are propagated by yggdrail on agenda approval, treatments/decision-activities only when decisions are released
      const treatment = yield agendaitem?.treatment;
      const decisionActivity = yield treatment?.decisionActivity;
      const resultCode = yield decisionActivity?.decisionResultCode;
      // Other profiles should not have the latest decision when decisions have not been released yet
      this.modelsOfMeetings.push([meeting, agenda, agendaitem, resultCode]);
    }
  }
}