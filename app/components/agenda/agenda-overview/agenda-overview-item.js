import AgendaSidebarItem from 'frontend-kaleidos/components/agenda/agenda-detail/sidebar-item';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { timeout, dropTask, task } from 'ember-concurrency';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import CONFIG from 'frontend-kaleidos/utils/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

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
  @tracked isShowingAllDocuments = false;
  @tracked documentsAreVisible = false;
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
    // Additional failsafe check on document visibility. Strictly speaking this check
    // is not necessary since documents are not propagated by Yggdrasil if they
    // should not be visible yet for a specific profile.
    const decisionActivityResultCode = yield this.decisionActivity
      ?.decisionResultCode;
    const { INGETROKKEN, UITGESTELD } = CONSTANTS.DECISION_RESULT_CODE_URIS;
    if (this.currentSession.may('view-documents-before-release')) {
      this.documentsAreVisible = true;
    } else if (
      !this.currentSession.may('view-postponed-and-retracted') &&
      [INGETROKKEN, UITGESTELD].includes(decisionActivityResultCode?.uri)
    ) {
      this.documentsAreVisible = false;
    } else {
      const documentPublicationActivity = yield this.args.meeting.internalDocumentPublicationActivity;
      const documentPublicationStatus = yield documentPublicationActivity?.status;
      this.documentsAreVisible = documentPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
    }
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
    yield this.decisionActivity?.decisionResultCode;
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
