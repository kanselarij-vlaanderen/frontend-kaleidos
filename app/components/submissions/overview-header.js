import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SubmissionsOverviewHeaderComponent extends Component {
  @service store;
  @service currentSession;
  @service agendaService;
  @service intl;

  @tracked selectedMeeting;

  @action
  transitionBack() {
    if (history.length > 1) {
      history.back();
    }
  }

  constructor() {
    super(...arguments);
    this.loadMeeting.perform();
  }

  get overviewRoute() {
    return this.args.submission.isConcept ? 'submissions.concepts' : 'submissions.ongoing';
  }

  get overviewRouteLabel() {
    return this.args.submission.isConcept ? this.intl.t('all-submission-concepts') : this.intl.t('all-submissions');
  }
  
  loadMeeting = task(async () => {
    if (this.args.submission) {
      const meeting = await this.args.submission.meeting;
      if (meeting?.id && this.currentSession.may('create-subcases-from-submissions')) {
        // only editors can use the store if not propagated yet
        this.selectedMeeting = meeting;
      } else {
        // get meeting when not propagated yet
        const submissionStatus = await this.args.submission.status;
        if (submissionStatus.uri !== CONSTANTS.SUBMISSION_STATUSES.CONCEPT) {
          const agenda = await this.agendaService.getAgendaAndMeetingForSubmission(this.args.submission);
          this.selectedMeeting = agenda.createdFor;
        }
      }
    }
  });
}
