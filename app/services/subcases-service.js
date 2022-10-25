import Service, { inject as service } from '@ember/service';
import moment from 'moment';

export default class SubcasesService extends Service {
  @service store;
  @service intl;

  async getSubcasePhases(subcase) {
    const phases = [];
    const sortedAgendaActivities = await this.store.query('agenda-activity', {
      'filter[subcase][:id:]': subcase.id,
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
      const firstAgendaitemOfActivity = await this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': activity.id,
        'filter[:has-no:previous-version]': 't',
        sort: 'created',
      });
      const agenda = await firstAgendaitemOfActivity.agenda;
      const agendaStatus = await agenda.belongsTo('status').reload();
      if (!agendaStatus.isDesignAgenda) {
        const meeting = await agenda.createdFor;
        phases.push({
          label: this.intl.t('activity-phase-approved-on-agenda'),
          date: moment.utc(meeting.plannedStart).toDate(),
        });
        // phase 3: if on approved, what is the decision
        const treatment = await firstAgendaitemOfActivity.treatment;
        const decisionActivity = await treatment.decisionActivity;
        const decisionResultCode = await decisionActivity.belongsTo('decisionResultCode').reload();

        if (decisionResultCode) {
          phases.push({
            label: `${decisionResultCode.label} ${this.intl.t(
              'decision-activity-result'
            )}`,
            date: moment.utc(meeting.plannedStart).toDate(),
          });
          // phase 4: add an extra fase in case of a postponed subcase
          if (decisionResultCode.isPostponed) {
            phases.push({
              label: this.intl.t('decision-activity-result-postponed'),
            });
          }
        }
      }
    }
    return phases;
  }
}
