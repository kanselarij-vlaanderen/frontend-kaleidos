import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import addWeeks from 'date-fns/addWeeks';


/**
 * @argument subcase
 * @argument meeting
 * @argument agendaActivity
 */
export default class AgendaitemPostponed extends Component {
  @service store;
  @service agendaService;

  @tracked isEditing = false;
  @tracked canPropose = false;
  @tracked modelsForProposedAgenda;
  @tracked newMeeting;

  constructor() {
    super(...arguments);
    this.loadProposedStatus.perform();
    this.loadProposableMeetings.perform();
  }

  @task
  *loadProposedStatus() {
    // We have to check if the proposed agendaitem is already proposed for a new meeting before showing the button
    // we have to generate a link to the latest meeting (not the next if multiple).
    const agendaActivities = yield this.store.query('agenda-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      'filter[:gt:start-date]': this.args.meeting.plannedStart.toISOString(),
      sort: '-start-date',
      // 'filter[agendaitems][agenda][created-for][is-final]': false,
    });
    console.log('agendaActivities', agendaActivities)
    // If any agenda-activities exist that are created after this one we can assume the subcase is already proposed again.
    this.canPropose = agendaActivities.length ? false : true;
    if(!this.canPropose) {
      // load the latest agenda link
      const latestActivity = agendaActivities.firstObject;
      const latestAgendaitem = yield this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': latestActivity.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });
      const agenda =  yield latestAgendaitem.agenda;
      const meeting = yield agenda.createdFor;
      this.newMeeting = meeting;
      this.modelsForProposedAgenda = [meeting.id, agenda.id, latestAgendaitem.id];
    }
  }
  @task
  *loadProposableMeetings() {
    const futureDate = addWeeks(new Date(), 20);
    // this might be subject to change
    return yield this.store.query('meeting', {
      filter: {
        ':gt:planned-start': this.args.meeting.plannedStart.toISOString(),
        // ':gte:planned-start': new Date().toISOString(), // for local testing, too many agendas exist
        ':lte:planned-start': futureDate.toISOString(),
        'is-final': false,
      },
      sort: 'planned-start',
    });
  }

  @task
  *reProposeForAgenda(meeting) {
    let submissionActivities = yield this.store.query('submission-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      'filter[agenda-activity][:id:]': this.args.agendaActivity.id,
    });
    submissionActivities = submissionActivities.toArray();
    if (!submissionActivities.length) {
      const now = new Date();
      const submissionActivity = this.store.createRecord('submission-activity', {
        startDate: now,
        subcase: this.subcase,
      });
      yield submissionActivity.save();
      submissionActivities = [submissionActivity];
    }
    yield this.agendaService.putSubmissionOnAgenda(meeting, submissionActivities);
    this.canPropose = false;
  }

}
