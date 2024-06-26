import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import addLeadingZeros from 'frontend-kaleidos/utils/add-leading-zeros';

export default class ShortlistPublicationsTableRowComponent extends Component {
  @service store;

  @tracked agendaitem;
  @tracked meetingId;
  @tracked agendaId;
  @tracked formattedAgendaNumber = "";
  @tracked mandateePersonNames;
  @tracked decisionDate;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const piece = yield this.args.row;
    this.agendaitem = yield this.store.queryOne('agendaitem', {
      'filter[pieces][:id:]': piece.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    
    const agenda = yield this.agendaitem.agenda;
    this.agendaId = agenda.id;
    const meeting = yield agenda.createdFor;
    this.meetingId = yield meeting.id;

    const agendaitemNumber = this.agendaitem.number;
    this.formattedAgendaNumber = addLeadingZeros(agendaitemNumber, 4);
    yield this.loadMandateeData.perform();
    yield this.loadDecisionDate.perform();
  }

  @task
  *loadMandateeData() {
    const mandatees = yield this.agendaitem.mandatees;
    const persons = yield Promise.all(
      mandatees
        .slice()
        .sort((m1, m2) => m1.priority - m2.priority)
        .map((mandatee) => mandatee.person)
    );
    this.mandateePersonNames = persons.map((person) => person.fullName);
  }

  @task
  *loadDecisionDate() {
    const agendaitem = yield this.agendaitem;
    const treatment = yield agendaitem.treatment;
    const decisionActivity = yield treatment.decisionActivity;
    this.decisionDate = yield decisionActivity.startDate;
  }
}
