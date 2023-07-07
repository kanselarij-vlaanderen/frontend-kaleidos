import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { TrackedArray } from 'tracked-built-ins';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

const MANDATORY_SORT_OPTION = 'decision-activity';
const DEFAULT_SORT_OPTIONS = [
  '-decision-activity.start-date',
  MANDATORY_SORT_OPTION,
  'sign-subcase.sign-marking-activity.piece.name',
];

export default class SignaturesIndexController extends Controller {
  @service intl;
  @service router;
  @service store;
  @service signatureService;
  @service toaster;

  @tracked signFlow = null;
  @tracked piece = null;
  @tracked decisionActivity = null;
  @tracked agendaitem = null;
  @tracked agenda = null;
  @tracked meeting = null;

  @tracked showSidebar = false;
  @tracked showFilterModal = false;
  @tracked selectedMinisters = [];
  @tracked filteredMinisters = [];

  @tracked selectedSignFlows = new TrackedArray([]);

  @tracked sizeSignaturesIndex = PAGINATION_SIZES[5];
  @tracked pageSignaturesIndex = 0;
  @tracked sortSignaturesIndex = DEFAULT_SORT_OPTIONS.join(',');
  @tracked sortField;

  signers = [];
  approvers = [];
  notificationAddresses = [];

  queryParams = [
    { sizeSignaturesIndex: { type: 'number' } },
    { pageSignaturesIndex: { type: 'number' } },
    { sortSignaturesIndex: { type: 'string' } },
  ];

  localStorageKey = 'signatures.shortlist.minister-filter';

  selectedDecisionActivities = trackedFunction(this, async () => {
    return await Promise.all(
      this.selectedSignFlows.map(async (signFlow) => await signFlow.decisionActivity)
    );
  });

  get customNavbarButtonsElement() {
    return document.getElementById('signatures-navbar-buttons-area');
  }

  get isSelectedAllItems() {
    return this.model.every((signFlow) => this.selectedSignFlows.indexOf(signFlow) >= 0);
  }

  get isSelectedSomeItems() {
    return this.model.some((signFlow) => this.selectedSignFlows.indexOf(signFlow) >= 0);
  }

  @action
  selectAll() {
    this.clearSidebarContentSingleItem();
    if (this.isSelectedAllItems) {
      this.closeSidebar();
      this.selectedSignFlows = new TrackedArray([]);
    } else {
      this.selectedSignFlows = new TrackedArray(this.model.toArray());
    }
  }

  @action
  toggleItem(item) {
    this.clearSidebarContentSingleItem();
    const index = this.selectedSignFlows.indexOf(item);
    if (index >= 0) {
      if (this.selectedSignFlows.length === 1) {
        // The untoggled checkbox is the last one, close the sidebar
        this.closeSidebar();
      }
      this.selectedSignFlows.splice(index, 1);
    } else {
      this.selectedSignFlows.push(item);
    }
  }

  @action
  changeSort(sortField) {
    this.sortField = sortField;
    // Because we want to group the documents/sign flows per decision
    // activity we need to keep the sort options in the same order.
    // Toggle default options in place and add new options in front.
    if (this.sortField) {
      let newSortOptions = [...DEFAULT_SORT_OPTIONS];
      const index = newSortOptions
            .map((option) => option.replace(/-/g, ''))
            .indexOf(this.sortField.replace(/-/g, ''));
      if (index >= 0) {
        newSortOptions[index] = this.sortField;
      } else {
        newSortOptions = [this.sortField, ...DEFAULT_SORT_OPTIONS];
      }
      this.sortSignaturesIndex = newSortOptions.join(',');
    } else {
      this.sortSignaturesIndex = DEFAULT_SORT_OPTIONS.join(',');
    }
  }

  getMandateeNames = async (signFlow) => {
    const decisionActivity = await signFlow.decisionActivity;
    const subcase = await decisionActivity.subcase;
    const mandatees = await subcase.mandatees;
    const persons = await Promise.all(
      mandatees
        .toArray()
        .sort((m1, m2) => m1.priority - m2.priority)
        .map((mandatee) => mandatee.person)
    );
    return persons.map((person) => person.fullName);
  }

  getDecisionActivity = async (piece) => {
    const agendaitem = await this.getAgendaitem(piece);
    const treatment = await agendaitem.treatment;
    return treatment.decisionActivity;
  }

  getAgendaitem = async (pieceOrPromise) => {
    const piece = await pieceOrPromise;
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
    this.signFlow = null;
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
    this.selectedSignFlows = new TrackedArray([]);
    this.signers = [];
    this.approvers = [];
    this.notificationAddresses = [];
  }

  @action
  async openSidebarSingleItem(signFlow, piece) {
    this.clearSidebarContentMultiItem();
    this.signFlow = signFlow;
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
    try {
      if (this.selectedSignFlows.length) {
        await this.signatureService.createSignFlow(
          this.selectedSignFlows,
          this.signers,
          this.approvers,
          this.notificationAddresses,
        );
      } else if (this.signFlow) {
        await this.signatureService.createSignFlow(
          [this.signFlow],
          this.signers,
          this.approvers,
          this.notificationAddresses
        );
      }
      this.closeSidebar();
      await this.router.refresh(this.router.routeName);
      if (this.selectedSignFlows.length > 1) {
        this.toaster.success(
          this.intl.t('documents-were-sent-to-signinghub'),
          this.intl.t('successfully-started-sign-flows')
        );
      } else {
        this.toaster.success(
          this.intl.t('document-was-sent-to-signinghub'),
          this.intl.t('successfully-started-sign-flow')
        );
      }
    } catch {
      this.closeSidebar();
      await this.router.refresh(this.router.routeName);
      this.toaster.error(
        this.intl.t('create-sign-flow-error-message'),
        this.intl.t('warning-title')
      );
    }
  });

  removeSignFlow = task(async () => {
    if (this.selectedSignFlows.length) {
      for (let signFlow of this.selectedSignFlows) {
        await this.signatureService.removeSignFlow(signFlow);
      }
    } else if (this.signFlow) {
      await this.signatureService.removeSignFlow(this.signFlow);
    }
    this.closeSidebar();
    this.router.refresh(this.router.routeName);
  });
}
