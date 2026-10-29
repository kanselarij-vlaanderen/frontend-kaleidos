import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { subDays } from 'date-fns';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';

/**
 * @argument subcase
 * @argument meeting
 * @argument agendaActivity
 */
export default class AgendaitemRetracted extends Component {
  @service store;
  @service agendaService;
  @service toaster;
  @service intl;
  @service router;

  @tracked decisionmakingFlow;
  @tracked modelsForProposedAgenda;
  @tracked latestMeeting;
  @tracked isProposingForOtherMeeting = false;

  constructor() {
    super(...arguments);
    this.loadProposedStatus.perform();
    this.loadDecisionmakingFlow.perform();
  }

  loadDecisionmakingFlow = task(async () => {
    if (this.args.subcase) {
      this.decisionmakingFlow = await this.args.subcase.decisionmakingFlow;
    }
  });

  loadProposedStatus = task(async () => {
    // If any agenda-activities exist that are created after this one we can assume the subcase is already proposed again.
    // Filtering on agenda-activities that are more recent than the agenda-activity of the postponed agendaitem
    let latestAgendaActivity;
    if (this.args.subcase) {
      latestAgendaActivity = await this.store.queryOne('agenda-activity', {
        'filter[subcase][:id:]': this.args.subcase.id,
        'filter[:gt:start-date]':
          this.args.agendaActivity.startDate.toISOString(),
        sort: 'start-date',
      });
    }

    if (latestAgendaActivity) {
      // we have to generate a link to the latest meeting
      // The subcase could be postponed on multipe meetings, but we show only the latest one
      const latestAgendaitem = await this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': latestAgendaActivity.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });
      const agenda = await latestAgendaitem.agenda;
      const meeting = await agenda.createdFor;
      this.latestMeeting = meeting;
      this.modelsForProposedAgenda = [
        meeting.id,
        agenda.id,
        latestAgendaitem.id,
      ];
    } else {
      await this.loadProposableMeetings.perform();
    }
  });

  loadProposableMeetings = task(async () => {
    const aWeekAgo = subDays(new Date(), 7, this.args.meeting.plannedStart);
    const meetings = await this.store.query('meeting', {
      filter: {
        ':gt:planned-start': aWeekAgo.toISOString(),
        ':has-no:agenda': true
      },
      sort: '-planned-start',
    });
    const allRecentMeetings = meetings.slice();
    // filter our own meeting if present
    removeObject(allRecentMeetings, this.args.meeting);
    return allRecentMeetings;
  });

  reProposeForMeeting = task(async (meeting) => {
    this.closeProposingForOtherMeetingModal();
    try {
      await this.agendaService.putSubmissionOnAgenda(meeting, this.args.subcase);
    } catch (error) {
      this.router.refresh();
      this.toaster.error(
        this.intl.t('error-while-submitting-subcase-on-meeting', { error: error.message }),
        this.intl.t('warning-title')
      );
    }
    await this.loadProposedStatus.perform();
  });

  transitionToCase = async() => {
    this.router.transitionTo('cases.case.subcases', this.decisionmakingFlow.id);
  }

  transitionToRetractedAgenda = async() => {
    this.router.transitionTo('agenda.agendaitems.agendaitem', ...this.modelsForProposedAgenda);
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
