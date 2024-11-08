import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SubmissionsOverviewHeaderComponent extends Component {
  @service store;
  @service currentSession;
  @service agendaService;

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

  loadMeeting = task(async () => {
    if (this.args.submission) {
      const meeting = await this.args.submission.meeting;
      if (meeting?.id && this.currentSession.may('create-subcases-from-submissions')) {
        // only editors can use the store if not propagated yet
        this.selectedMeeting = meeting;
      } else {
        // get meeting when not propagated yet
        const agenda = await this.agendaService.getAgendaAndMeetingForSubmission(this.args.submission);
        this.selectedMeeting = agenda.createdFor;
      }
    }
  });
}
