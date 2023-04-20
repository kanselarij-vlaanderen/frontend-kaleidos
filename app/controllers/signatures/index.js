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
  @tracked showFilterModal = false;
  @tracked selectedMinisters = [];
  @tracked filteredMinisters = [];

  localStorageKey = 'signatures.shortlist.minister-filter';

  getDecisionDate = async (piece) => {
    const decisionActivity = await this.getDecisionActivity(piece);
    return decisionActivity.startDate;
  }

  getMandateeName = async (piece) => {
    const decisionActivity = await this.getDecisionActivity(piece);
    const subcase = await decisionActivity.subcase;
    const mandatee = await subcase.requestedBy;
    const person = await mandatee.person;
    return person.fullName
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

  async getDecisionActivity(piece) {
    const agendaitem = await this.getAgendaitem(piece);
    const treatment = await agendaitem.treatment;
    return treatment.decisionActivity;
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

  @action
  openFilterModal() {
    this.selectedMinisters = this.filteredMinisters;
    this.showFilterModal = true;
  }

  @action
  closeFilterModal() {
    this.showFilterModal = false;
    this.selectedMinisters = this.filteredMinisters;
  }

  @action
  clearFilter() {
    this.showFilterModal = false;
    this.selectedMinisters = [];
    this.filteredMinisters = [];
    this.saveSelectedToLocalStorage();
    this.router.refresh(this.router.routeName);
  }

  @action
  applyFilter() {
    this.filteredMinisters = this.selectedMinisters;
    this.saveSelectedToLocalStorage();
    this.router.refresh(this.router.routeName);
    this.showFilterModal = false;
  }

  saveSelectedToLocalStorage() {
    localStorage.setItem(
      this.localStorageKey,
      JSON.stringify(this.filteredMinisters)
    );
  }

}
