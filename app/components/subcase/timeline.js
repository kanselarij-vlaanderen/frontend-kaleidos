import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';

export default class SubcaseTimeline extends Component {
  @service store;
  @service intl;

  @tracked phases;

  constructor() {
    super(...arguments);
    this.loadSubcasePhases.perform();
  }

  subcaseTimelineItemText = (timelineItem) => {
    const label = timelineItem.label || '';
    const date = timelineItem.date;
    let textToShow = `${label}`;
    if (date) {
      textToShow += ` ${dateFormat(date, 'dd MMMM yyyy')}`;
    }
    return textToShow;
  };

  @dropTask
  *loadSubcasePhases() {
    const phases = [];
    const sortedAgendaActivities = yield this.store.queryAll(
      'agenda-activity',
      {
        'filter[subcase][:id:]': this.args.subcase.id,
        sort: 'start-date',
      }
    );

    for (const activity of sortedAgendaActivities.slice()) {
      // phase 1: When was the subcase proposed
      if (activity.startDate) {
        phases.push({
          label: this.intl.t('activity-phase-proposed-for-agenda'),
          date: activity.startDate,
        });
      }
      // phase 2: Is the subcase on an approved agenda or design agenda (for editors)
      const latestAgendaitemOfActivity = yield this.store.queryOne(
        'agendaitem',
        {
          'filter[agenda-activity][:id:]': activity.id,
          'filter[:has-no:next-version]': 't',
          sort: '-created',
        }
      );
      const agenda = yield latestAgendaitemOfActivity.agenda;
      const previousAgendaitem =
        yield latestAgendaitemOfActivity.previousVersion;
      const agendaStatus = yield agenda.belongsTo('status').reload();
      const agendaType =
        agendaStatus.isDesignAgenda && !previousAgendaitem
          ? 'ontwerpagenda'
          : 'agenda';
      const agendaTypeLabel = this.intl.t(
        'activity-phase-approved-on-agenda-suffix',
        { agenda: agendaType }
      );
      const meeting = yield agenda.createdFor;
      // this includes a link to design or approved agenda
      phases.push({
        label: this.intl.t('activity-phase-approved-on-agenda'),
        date: meeting.plannedStart,
        meetingId: meeting.id,
        agendaId: agenda.id,
        agendaitemId: latestAgendaitemOfActivity.id,
        beforeText: this.intl.t('activity-phase-approved-on-agenda-prefix'),
        linkText: `${agendaTypeLabel} ${dateFormat(
          meeting.plannedStart,
          'dd MMMM yyyy'
        )}`,
      });

      // phase 3: if on approved agenda at least once, what is the decision if a result has been set
      if (!agendaStatus.isDesignAgenda || previousAgendaitem) {
        const treatment = yield latestAgendaitemOfActivity.treatment;
        const decisionActivity = yield treatment?.decisionActivity;

        if (decisionActivity) {
          const decisionResultCode = yield decisionActivity
            .belongsTo('decisionResultCode')
            .reload();
          // legacy subcases might not have a decisionResultCode. In that case we don't show anything in the timeline.
          if (decisionResultCode) {
            phases.push({
              label: `${decisionResultCode.label} ${this.intl.t(
                'decision-activity-result'
              )}`,
              date: meeting.plannedStart,
            });
          }
        }
      }
    }
    this.phases = phases.reverse();
  }
}
