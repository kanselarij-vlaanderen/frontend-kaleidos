import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SignaturesIndexController extends Controller {
  @service router;
  @service store;

  @tracked piece = null;
  @tracked agendaitem = null;
  @tracked agenda = null;
  @tracked meeting = null;
  @tracked showSidebar = false;

  getDecisionDate = async (piece) => {
    const agendaitem = await this.getAgendaitem(piece);
    const treatment = await agendaitem.treatment;
    const decisionActivity = await treatment.decisionActivity;
    return decisionActivity.startDate;
  }

  getMandateeNames = async (piece) => {
    const agendaitem = await this.getAgendaitem(piece);
    const mandatees = await agendaitem.mandatees;
    const persons = await Promise.all(
      mandatees.map((mandatee) => mandatee.person)
    );
    return persons.map((person) => person.fullName);
  }

  async getAgendaitem(piece) {
    const agendaitems = await piece.agendaitems;
    let agendaitem;
    for (let maybeAgendaitem of agendaitems) {
      const agenda = await maybeAgendaitem.agenda;
      const nextVersion = await agenda.nextVersion;
      if (!nextVersion) {
        agendaitem = maybeAgendaitem;
        break;
      }
    }
    return agendaitem;
  }

  async getAgendaitemRouteModels(piece) {
    const agendaitem = await this.getAgendaitem(piece);
    if (agendaitem) {
      const agenda = await agendaitem.agenda;
      const meeting = await agenda.meeting;
      return [meeting, agenda, agendaitem];
    }
    return [];
  }

  @action
  async openSidebar(piece) {
    this.piece = piece;
    [
      this.meeting,
      this.agenda,
      this.agendaitem
    ] = await this.getAgendaitemRouteModels(piece);
    this.showSidebar = true;
  }

  @action
  closeSidebar() {
    this.piece = null;
    this.agendaitem = null;
    this.agenda = null;
    this.meeting = null;
    this.showSidebar = false;
  }
}
