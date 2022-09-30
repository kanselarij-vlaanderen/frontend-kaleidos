import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import addWeeks from 'date-fns/addWeeks';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

/**
 * @argument subcase
 * @argument meeting
 * @argument agendaActivity
 */
export default class AgendaitemPostponed extends Component {
  @service store;
  @service agendaService;

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
    // filtering on meeting.plannedStart will not find any if reProposing happened before the meeting "started" at 10 am
    let agendaActivities = yield this.store.query('agenda-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      'filter[:gt:start-date]':
        this.args.agendaActivity.startDate.toISOString(),
      sort: '-start-date',
    });
    // If any agenda-activities exist that are created after this one we can assume the subcase is already proposed again.
    this.canPropose = agendaActivities.length ? false : true;
    if (!this.canPropose) {
      // load the latest agenda link
      const latestActivity = agendaActivities.firstObject;
      const latestAgendaitem = yield this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': latestActivity.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });
      const agenda = yield latestAgendaitem.agenda;
      const meeting = yield agenda.createdFor;
      this.newMeeting = meeting;
      this.modelsForProposedAgenda = [
        meeting.id,
        agenda.id,
        latestAgendaitem.id,
      ];
    }
  }
  @task
  *loadProposableMeetings() {
    const futureDate = addWeeks(new Date(), 20);
    // this might be subject to change
    return yield this.store.query('meeting', {
      filter: {
        ':gt:planned-start': this.args.meeting.plannedStart.toISOString(),
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
      'page[size]': PAGE_SIZE.ACTIVITIES,
      include: 'pieces', // Make sure we have all pieces, unpaginated
    });
    const pieces = [];
    for (const submissionActivity of submissionActivities.toArray()) {
      let submissionPieces = yield submissionActivity.pieces;
      submissionPieces = submissionPieces.toArray();
      pieces.push(...submissionPieces);
    }
    const submissionActivity = this.store.createRecord('submission-activity', {
      startDate: new Date(),
      subcase: this.args.subcase,
      pieces: pieces,
    });
    yield submissionActivity.save();
    yield this.agendaService.putSubmissionOnAgenda(meeting, [
      submissionActivity,
    ]);
    yield this.loadProposedStatus.perform();
  }
}
