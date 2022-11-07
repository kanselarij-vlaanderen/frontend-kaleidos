import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import { dropTask } from 'ember-concurrency';

export default class SubcaseTimeline extends Component {
  @service store;
  @service intl;

  @tracked phases;

  constructor() {
    super(...arguments);
    this.loadSubcasePhases.perform();
  }

  @dropTask
  *loadSubcasePhases() {
    const phases = [];
    const sortedAgendaActivities = yield this.store.query('agenda-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      sort: 'start-date',
    });

    for (const activity of sortedAgendaActivities.toArray()) {
      // phase 1: When was the subcase proposed
      if (activity.startDate) {
        phases.push({
          label: this.intl.t('activity-phase-proposed-for-agenda'),
          date: moment.utc(activity.startDate).toDate(),
        });
      }
      // phase 2: Is the subcase on an approved agenda
      const firstAgendaitemOfActivity = yield this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': activity.id,
        'filter[:has-no:previous-version]': 't',
        sort: 'created',
      });
      const agenda = yield firstAgendaitemOfActivity.agenda;
      const agendaStatus = yield agenda.belongsTo('status').reload();
      if (!agendaStatus.isDesignAgenda) {
        const meeting = yield agenda.createdFor;
        phases.push({
          label: this.intl.t('activity-phase-approved-on-agenda'),
          date: moment.utc(meeting.plannedStart).toDate(),
        });
        // phase 3: if on approved, what is the decision
        const treatment = yield firstAgendaitemOfActivity.treatment;
        const decisionActivity = yield treatment?.decisionActivity;

        if (decisionActivity) {
          const decisionResultCode = yield decisionActivity.belongsTo('decisionResultCode').reload();
          phases.push({
            label: `${decisionResultCode.label} ${this.intl.t(
              'decision-activity-result'
            )}`,
            date: moment.utc(meeting.plannedStart).toDate(),
          });
          // phase 4: add an extra fase in case of a postponed subcase
          if (decisionActivity.isPostponed) {
            phases.push({
              label: this.intl.t('decision-activity-result-postponed'),
            });
          }
        }
      }
    }
    this.phases = phases;
  }
}
