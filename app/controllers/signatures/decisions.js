import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'reactiveweb/function';
import { TrackedArray } from 'tracked-built-ins';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import { warn } from '@ember/debug';
import CopyErrorToClipboardToast from 'frontend-kaleidos/components/utils/toaster/copy-error-to-clipboard-toast';

const MANDATORY_SORT_OPTION = '-meeting.planned-start';
const DEFAULT_SORT_OPTIONS = [
  MANDATORY_SORT_OPTION,
  'sign-subcase.sign-marking-activity.piece.name',
];

export default class SignaturesDecisionsController extends Controller {
  @service intl;
  @service router;
  @service store;
  @service signatureService;
  @service toaster;

  @tracked signFlow = null;
  @tracked piece = null;
  @tracked decisionActivityOrMeeting = null;
  @tracked agendaitem = null;
  @tracked agenda = null;
  @tracked meeting = null;

  @tracked showSidebar = false;

  @tracked selectedSignFlows = new TrackedArray([]);

  @tracked sizeSignaturesDecisions = PAGINATION_SIZES[5];
  @tracked pageSignaturesDecisions = 0;
  @tracked sortSignaturesDecisions = DEFAULT_SORT_OPTIONS.join(',');
  @tracked sortField;

  signers = [];

  queryParams = [
    { sizeSignaturesDecisions: { type: 'number' } },
    { pageSignaturesDecisions: { type: 'number' } },
    { sortSignaturesDecisions: { type: 'string' } },
  ];

  selectedDecisionActivitiesOrMeetings = trackedFunction(this, async () => {
    return await Promise.all(
      this.selectedSignFlows.map(async (signFlow) => await this.getDecisionActivityOrMeeting(signFlow))
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
      this.selectedSignFlows = new TrackedArray(this.model.slice());
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
      this.sortSignaturesDecisions = newSortOptions.join(',');
    } else {
      this.sortSignaturesDecisions = DEFAULT_SORT_OPTIONS.join(',');
    }
  }

  getDecisionActivityOrMeeting = async (signFlowOrPromise) => {
    const signFlow = await signFlowOrPromise;
    const decisionActivity = await signFlow.decisionActivity;
    if (decisionActivity) {
      return decisionActivity;
    } else {
      return await signFlow.meeting;
    }
  }

  getSecretaryName = async (signFlowOrPromise) => {
    const decisionActivityOrMeeting = await this.getDecisionActivityOrMeeting(signFlowOrPromise);
    const secretary = await decisionActivityOrMeeting.secretary;
    const person = await secretary.person;
    return person.fullName;
  }

  getMeetingDate = async (signFlowOrPromise) => {
    const signFlow = await signFlowOrPromise;
    const meeting = await signFlow.meeting;
    return meeting.plannedStart;
  }

  getAgendaitem = async (pieceOrPromise) => {
    const piece = await pieceOrPromise;
    const agendaitem = await this.store.queryOne('agendaitem', {
      'filter[treatment][decision-activity][report][:id:]' : piece.id,
    });
    return agendaitem;
  }

  async getAgendaRouteModels(piece) {
    const modelName = piece.constructor.modelName;
    if (modelName === 'report') {
      const agendaitem = await this.getAgendaitem(piece);
      if (agendaitem) {
        const agenda = await agendaitem.agenda;
        const meeting = await agenda.createdFor;
        return [meeting, agenda, agendaitem];
      }
    }
    if (modelName === 'minutes') {
      const meeting = await this.store.queryOne('meeting', {
        'filter[minutes][:id:]': piece.id,
      });
      const agenda = await this.store.queryOne('agenda', {
        'filter[created-for][:id:]': meeting.id,
        sort: '-serialnumber',
        include: 'status',
      });
      return [meeting, agenda, null];
    }
    warn('found a marked piece that is neither a report nor minutes');
    return [null, null, null];
  }

  clearSidebarContentSingleItem() {
    this.signFlow = null;
    this.piece = null;
    this.meeting = null;
    this.agenda = null;
    this.agendaitem = null;
    this.decisionActivityOrMeeting = null;
    this.signers = [];
  }

  clearSidebarContentMultiItem() {
    this.selectedSignFlows = new TrackedArray([]);
    this.signers = [];
  }

  @action
  async openSidebarSingleItem(signFlow, piece) {
    // TODO, this is happening async, so links can point to the wrong piece or agenda when we are switching between 2
    this.clearSidebarContentMultiItem();
    this.signFlow = await signFlow;
    this.piece = await piece;
    [this.meeting, this.agenda, this.agendaitem] =
      await this.getAgendaRouteModels(this.piece);
    this.decisionActivityOrMeeting = await this.getDecisionActivityOrMeeting(signFlow);
    this.signers = [];
    this.showSidebar = true;
  }

  @action
  async openSidebarMultiItem() {
    this.signers = [];
    this.showSidebar = true;
  }

  @action
  closeSidebar() {
    this.showSidebar = false;
    this.clearSidebarContentMultiItem();
    this.clearSidebarContentSingleItem();
  }
  
  createSignFlow = task(async () => {
    try {
      if (this.selectedSignFlows.length) {
        await this.signatureService.createSignFlow(
          this.selectedSignFlows,
          this.signers,
          [],
          [],
        );
      } else if (this.signFlow) {
        await this.signatureService.createSignFlow(
          [this.signFlow],
          this.signers,
          [],
          [],
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
    } catch (error) {
      this.closeSidebar();
      await this.router.refresh(this.router.routeName);
      const digitalSigningErrorOptions = {
        title: this.intl.t('warning-title'),
        message: this.intl.t('create-sign-flow-error-message'),
        errorContent: error.message,
        showDatetime: true,
        options: {
          timeOut: 60 * 10 * 1000,
        },
      };
      this.toaster.show(CopyErrorToClipboardToast, digitalSigningErrorOptions);
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
