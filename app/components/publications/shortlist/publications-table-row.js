import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';


export default class ShortlistPublicationsTableRowComponent extends Component {
  @tracked agendaitem
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
    const agendaitems = yield piece.agendaitems;
    for (let maybeAgendaitem of agendaitems) {
      const maybeAgendaitemAgenda = yield maybeAgendaitem.agenda;
      const nextVersion = yield maybeAgendaitemAgenda.nextVersion;
      if (!nextVersion) {
        this.agendaitem = maybeAgendaitem;
        break;
      }
    }
    const agenda = yield this.agendaitem.agenda;
    this.agendaId = agenda.id;
    const meeting = yield agenda.createdFor;
    this.meetingId = yield meeting.id;

    const agendaitemNumber = this.agendaitem.number;
    const agendaitemNumberLength = agendaitemNumber.toString().length;
    if (agendaitemNumberLength < 4) {
      for (let index = 0; index < 4 - (agendaitemNumberLength * 1); index++) {
        this.formattedAgendaNumber += "0"
      }
      this.formattedAgendaNumber += agendaitemNumber.toString();
    } else {
      this.formattedAgendaNumber = this.agendaitem.number
    }
    yield this.loadMandateeData.perform();
    yield this.loadDecisionDate.perform();
  }

  @task
  *loadMandateeData() {
    const mandatees = yield this.agendaitem.mandatees;
    const persons = yield Promise.all(
      mandatees.map((mandatee) => mandatee.person)
    );
    this.mandateePersonNames = persons.map((person) => person.fullName);
  }

  @task
  *loadDecisionDate () {
    const agendaitem = yield this.agendaitem;
    const treatment = yield agendaitem.treatment;
    const decisionActivity = yield treatment.decisionActivity;
    this.decisionDate = yield decisionActivity.startDate;
  }
}