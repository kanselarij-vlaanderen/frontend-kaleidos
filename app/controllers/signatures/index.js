import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { TrackedArray } from 'tracked-built-ins';

export default class SignaturesIndexController extends Controller {
  @service router;
  @service store;
  @service signatureService;

  @tracked piece = null;
  @tracked decisionActivity = null;
  @tracked agendaitem = null;
  @tracked agenda = null;
  @tracked meeting = null;

  @tracked showSidebar = false;
  @tracked showFilterModal = false;
  @tracked selectedMinisters = [];
  @tracked filteredMinisters = [];

  @tracked selectedPieces = new TrackedArray([]);

  signers = [];
  approvers = [];
  notificationAddresses = [];

  localStorageKey = 'signatures.shortlist.minister-filter';

  selectedDecisionActivities = trackedFunction(this, async () => {
    return await Promise.all(
      this.selectedPieces.map(async (piece) => await this.getDecisionActivity(piece))
    );
  });

  get customNavbarButtonsElement() {
    return document.getElementById('signatures-navbar-buttons-area');
  }

  get isSelectedAllItems() {
    return this.model.every((piece) => this.selectedPieces.indexOf(piece) >= 0);
  }

  get isSelectedSomeItems() {
    return this.model.some((piece) => this.selectedPieces.indexOf(piece) >= 0);
  }

  @action
  selectAll() {
    this.clearSidebarContentSingleItem();
    if (this.isSelectedAllItems) {
      this.closeSidebar();
      this.selectedPieces = new TrackedArray([]);
    } else {
      this.selectedPieces = new TrackedArray(this.model.toArray());
    }
  }

  @action
  toggleItem(item) {
    this.clearSidebarContentSingleItem();
    const index = this.selectedPieces.indexOf(item);
    if (index >= 0) {
      if (this.selectedPieces.length === 1) {
        // The untoggled checkbox is the last one, close the sidebar
        this.closeSidebar();
      }
      this.selectedPieces.splice(index, 1);
    } else {
      this.selectedPieces.push(item);
    }
  }

  getDecisionDate = async (piece) => {
    const decisionActivity = await this.getDecisionActivity(piece);
    return decisionActivity.startDate;
  };

  getMandateeName = async (piece) => {
    const decisionActivity = await this.getDecisionActivity(piece);
    const subcase = await decisionActivity.subcase;
    const mandatee = await subcase.requestedBy;
    const person = await mandatee.person;
    return person.fullName;
  };

  getDecisionActivity = async (piece) => {
    const agendaitem = await this.getAgendaitem(piece);
    const treatment = await agendaitem.treatment;
    return treatment.decisionActivity;
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

  clearSidebarContentSingleItem() {
    this.piece = null;
    this.meeting = null;
    this.agenda = null;
    this.agnedaitem = null;
    this.decisionActivity = null;
    this.signers = [];
    this.approvers = [];
    this.notificationAddresses = [];
  }

  clearSidebarContentMultiItem() {
    this.selectedPieces = new TrackedArray([]);
    this.signers = [];
    this.approvers = [];
    this.notificationAddresses = [];
  }

  @action
  async openSidebarSingleItem(piece) {
    this.clearSidebarContentMultiItem();
    this.piece = piece;
    [this.meeting, this.agenda, this.agendaitem] =
      await this.getAgendaitemRouteModels(piece);
    this.decisionActivity = await this.getDecisionActivity(piece);
    this.signers = [];
    this.approvers = [];
    this.notificationAddresses = [];
    this.showSidebar = true;
  }

  @action
  async openSidebarMultiItem() {
    this.signers = [];
    this.approvers = [];
    this.notificationAddresses = [];
    this.showSidebar = true;
  }

  @action
  closeSidebar() {
    this.showSidebar = false;
    this.clearSidebarContentMultiItem();
    this.clearSidebarContentSingleItem();
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

  createSignFlow = task(async () => {
    if (this.selectedPieces.length) {
      await Promise.all(this.selectedPieces.map(async (piece) => {
        const decisionActivity = await this.getDecisionActivity(piece);
        await this.signatureService.createSignFlow(
          piece,
          decisionActivity,
          this.signers,
          this.approvers,
          this.notificationAddresses
        );
      }));
    } else if (this.piece) {
      await this.signatureService.createSignFlow(
        this.piece,
        this.decisionActivity,
        this.signers,
        this.approvers,
        this.notificationAddresses
      );
    }
    this.closeSidebar();
    await this.router.refresh(this.router.routeName);
  });
}
