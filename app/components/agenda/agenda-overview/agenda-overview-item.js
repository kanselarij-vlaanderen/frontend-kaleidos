import AgendaSidebarItem from 'frontend-kaleidos/components/agenda/agenda-detail/sidebar-item';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { timeout, dropTask, task } from 'ember-concurrency';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import CONFIG from 'frontend-kaleidos/utils/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
const { INGETROKKEN, UITGESTELD } = CONSTANTS.DECISION_RESULT_CODE_URIS;

export default class AgendaOverviewItem extends AgendaSidebarItem {
  /**
   * @argument agendaitem
   * @argument meeting: the meeting that is currently open
   * @argument currentAgenda: the agenda that is currently open
   * @argument previousAgenda: the previous version of the currently open agenda
   * @argument isNew: boolean indicating if the item should be marked with the "new agenda-item"-icon
   * @argument isEditingFormallyOkStatus
   * @argument allowReorderItems: boolean to enable changing item order with drag-handle or move buttons
   * @argument showFormallyOkStatus: boolean indicating whether to show the formally ok status
   * @argument onMove: the function used to change item order by button click
   * @argument isFirst: boolean indicating whether it's the first nota or announcement
   * @argument isLast: boolean indicating whether it's the last nota or announcement
   */

  @service intl;
  @service toaster;
  @service agendaService;
  @service currentSession;
  @service throttledLoadingService;

  @tracked agendaitemDocuments;
  @tracked newAgendaitemDocuments;

  @tracked decisionActivity;
  @tracked decisionActivityResultCode;
  @tracked isPreliminaryPostponed = false;
  @tracked isPreliminaryRetracted = false;
  @tracked isShowingAllDocuments = false;
  @tracked documentsAreVisible = false;
  @tracked showDocumentsAreVisibleAlert = false;
  @tracked isEditingFormallyOk = false;

  constructor() {
    super(...arguments);
    this.agendaitemDocuments = [];
    this.newAgendaitemDocuments = [];
    this.loadDocuments.perform();
    this.loadDecisionActivity.perform();
  }

  get documentListSize() {
    return 20;
  }

  get limitedAgendaitemDocuments() {
    if (this.isShowingAllDocuments) {
      return this.agendaitemDocuments;
    }
    return this.agendaitemDocuments.slice(0, this.documentListSize);
  }

  get enableShowMore() {
    return this.agendaitemDocuments.length > this.documentListSize;
  }

  @task
  *setFormallyOkStatus(status) {
    yield this.args.setFormallyOkAction(status.uri);
  }

  @task
  *loadDocumentsPublicationStatus() {
    this.showDocumentsAreVisibleAlert = false;
    // Additional failsafe check on document visibility.
    // retracted and postponed documents are hidden for non admin because
    // we cannot match the "historic name" of the documents due to resubmitting
    const decisionPublicationActivity = yield this.args.meeting.belongsTo('internalDecisionPublicationActivity').reload();
    const decisionPublicationStatus = yield decisionPublicationActivity?.belongsTo('status').reload();
    const decisionsAreReleased = decisionPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;

    const documentPublicationActivity = yield this.args.meeting.belongsTo('internalDocumentPublicationActivity').reload();
    const documentPublicationStatus = yield documentPublicationActivity?.belongsTo('status').reload();
    const documentsAreReleased = documentPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;

    if (!decisionsAreReleased || this.args.currentAgenda.status.get('isDesignAgenda')) {
      this.documentsAreVisible = this.currentSession.may('view-documents-before-release');
      return;
    }

    // decisionsAreReleased
    if ([INGETROKKEN, UITGESTELD].includes(this.decisionActivityResultCode?.uri)) {
      this.documentsAreVisible = this.currentSession.may('view-documents-postponed-and-retracted-on-agendaitem');
      this.showDocumentsAreVisibleAlert = this.documentsAreVisible;
      return;
    }

    if (!documentsAreReleased) {
      this.documentsAreVisible = this.currentSession.may('view-documents-before-release');
      return;
    }
    // documentsAreReleased
    const { GOEDGEKEURD, KENNISNAME } = CONSTANTS.DECISION_RESULT_CODE_URIS;
    if ([GOEDGEKEURD, KENNISNAME].includes(this.decisionActivityResultCode?.uri)) {
      this.documentsAreVisible = true;
      return;
    }
    // no decisionResult after release
    this.documentsAreVisible = this.currentSession.may('view-documents-before-release');

    // any legacy has no decisionResultCode, the document access level will determine who can view
    if (this.args.meeting.isPreKaleidos) {
      this.documentsAreVisible = true;
    }
    return;
  }

  @task
  *loadDocuments() {
    let pieces = yield this.throttledLoadingService.loadPieces.linked().perform(this.args.agendaitem);
    pieces = pieces.slice();
    this.agendaitemDocuments = yield sortPieces(
      pieces,
      {
        isApproval: this.args.agendaitem.isApproval,
        isPreKaleidos: this.args.meeting.isPreKaleidos,
      }
    );
  }

  @task
  *loadDecisionActivity() {
    const treatment = yield this.args.agendaitem.treatment;
    this.decisionActivity = yield treatment?.decisionActivity;
    this.decisionActivityResultCode = yield this.decisionActivity?.belongsTo('decisionResultCode').reload();
    if (!this.decisionActivity?.uri && this.currentSession.may('view-preliminary-decisions')) {
      // get the preliminary decisionResultCode. Will only return something when postponed or retracted
      this.decisionActivityResultCode = yield this.agendaService.getPreliminaryDecisionResultCode(this.args.agendaitem);
      this.isPreliminaryPostponed = (this.decisionActivityResultCode?.uri == UITGESTELD);
      this.isPreliminaryRetracted = (this.decisionActivityResultCode?.uri == INGETROKKEN);
    }
    this.loadDocumentsPublicationStatus.perform();
  }

  @dropTask
  *lazyLoadSideData() {
    yield timeout(350);
    const tasks = [
      this.loadNewsItemVisibility,
      this.loadSubcase,
      this.loadNewDocuments
    ].filter((task) => task.performCount === 0);
    yield Promise.all(tasks.map((task) => task.perform()));
  }

  @task
  *loadNewDocuments() { // Documents to be highlighted
    if (this.args.previousAgenda) { // Highlighting everything on the first agenda-version as "new" doesn't add a lot of value.
      this.newAgendaitemDocuments = yield this.agendaService.changedPieces(this.args.currentAgenda.id,
        this.args.previousAgenda.id, this.args.agendaitem.id);
    }
  }


  @action
  cancelLazyLoad() {
    this.lazyLoadSideData.cancelAll();
  }

  @action
  toggleShowingAllDocuments() {
    this.isShowingAllDocuments = !this.isShowingAllDocuments;
  }

  @action
  async setAndSaveFormallyOkStatus(newFormallyOkUri) {
    this.args.agendaitem.formallyOk = newFormallyOkUri;
    const status = CONFIG.formallyOkOptions.find((type) => type.uri === newFormallyOkUri);
    try {
      await this.args.agendaitem.save();
      this.toaster.success(this.intl.t('successfully-modified-formally-ok-status', {
        status: status.label,
      }));
    } catch {
      this.args.agendaitem.rollbackAttributes();
      this.toaster.error();
    }
  }

  @action
  toggleIsEditingFormallyOk() {
    this.isEditingFormallyOk = !this.isEditingFormallyOk;
  }
}
