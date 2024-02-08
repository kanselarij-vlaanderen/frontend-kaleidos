import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import subDays from 'date-fns/subDays';

/**
 * @argument subcase
 * @argument meeting
 * @argument agendaActivity
 */
export default class AgendaitemPostponed extends Component {
  @service store;
  @service agendaService;
  @service toaster;
  @service intl;

  @tracked modelsForProposedAgenda;
  @tracked latestMeeting;
  @tracked isProposingForOtherMeeting = false;

  constructor() {
    super(...arguments);
    this.loadProposedStatus.perform();
  }

  @task
  *loadProposedStatus() {
    // If any agenda-activities exist that are created after this one we can assume the subcase is already proposed again.
    // Filtering on agenda-activities that are more recent than the agenda-activity of the postponed agendaitem
    let latestAagendaActivity;
    if (this.args.subcase) {
      latestAagendaActivity = yield this.store.queryOne('agenda-activity', {
        'filter[subcase][:id:]': this.args.subcase.id,
        'filter[:gt:start-date]':
          this.args.agendaActivity.startDate.toISOString(),
        sort: 'start-date',
      });
    }

    if (latestAagendaActivity) {
      // we have to generate a link to the latest meeting
      // The subcase could be postponed on multipe meetings, but we show only the latest one
      const latestAgendaitem = yield this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': latestAagendaActivity.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });
      const agenda = yield latestAgendaitem.agenda;
      const meeting = yield agenda.createdFor;
      this.latestMeeting = meeting;
      this.modelsForProposedAgenda = [
        meeting.id,
        agenda.id,
        latestAgendaitem.id,
      ];
    } else {
      yield this.loadProposableMeetings.perform();
    }
  }
  @task
  *loadProposableMeetings() {
    const aWeekAgo = subDays(new Date(), 7, this.args.meeting.plannedStart);
    const meetings = yield this.store.query('meeting', {
      filter: {
        ':gt:planned-start': aWeekAgo.toISOString(),
        ':has-no:agenda': true
      },
      sort: '-planned-start',
    });
    const allRecentMeetings = meetings.toArray();
    // filter our own meeting if present
    allRecentMeetings.removeObject(this.args.meeting);
    return allRecentMeetings;
  }

  @task
  *reProposeForMeeting(meeting) {
    this.closeProposingForOtherMeetingModal();
    try {
      yield this.agendaService.putSubmissionOnAgenda(meeting, this.args.subcase);
    } catch (error) {
      this.router.refresh();
      this.toaster.error(
        this.intl.t('error-while-submitting-subcase-on-meeting', { error: error.message }),
        this.intl.t('warning-title')
      );
    }
    yield this.loadProposedStatus.perform();
  }

  @action
  openProposingForOtherMeetingModal() {
    this.isProposingForOtherMeeting = true;
  }

  @action
  closeProposingForOtherMeetingModal() {
    this.isProposingForOtherMeeting = false;
  }
}
