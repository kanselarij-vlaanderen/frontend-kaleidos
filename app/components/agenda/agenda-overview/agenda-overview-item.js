import AgendaSidebarItem from 'frontend-kaleidos/components/agenda/agenda-detail/sidebar-item';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { timeout } from 'ember-concurrency';
import {
  dropTask,
  task
} from 'ember-concurrency';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import CONFIG from 'frontend-kaleidos/utils/config';
import VrNotulenName,
{ compareFunction as compareNotulen } from 'frontend-kaleidos/utils/vr-notulen-name';
import VrLegacyDocumentName, { compareFunction as compareLegacyDocuments } from 'frontend-kaleidos/utils/vr-legacy-document-name';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaOverviewItem extends AgendaSidebarItem {
  /**
   * @argument agendaitem
   * @argument meeting: the meeting that is currently open
   * @argument currentAgenda: the agenda that is currently open
   * @argument previousAgenda: the previous version of the currently open agenda
   * @argument isNew: boolean indicating if the item should be marked with the "new agenda-item"-icon
   * @argument isEditingFormallyOkStatus
   * @argument showDragHandle: boolean to show the drag-handle for changing item order
   * @argument showFormallyOkStatus: boolean indicating whether to show the formally ok status
   */

  @service store;
  @service intl;
  @service toaster;
  @service agendaService;
  @service router;
  @service currentSession;
  @service throttledLoadingService;

  @tracked agendaitemDocuments;
  @tracked newAgendaitemDocuments;

  @tracked isAgendaitemPostponedOrRetracted = false;
  @tracked isShowingAllDocuments = false;
  @tracked documentsAreVisible = false;

  constructor() {
    super(...arguments);
    this.agendaitemDocuments = [];
    this.newAgendaitemDocuments = [];
    this.loadDocuments.perform();
    this.loadDecisionActivity.perform();
    this.loadDocumentsPublicationStatus.perform();
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
    if (this.currentSession.isOverheid) {
      const documentPublicationActivity = yield this.args.meeting.internalDocumentPublicationActivity;
      if (documentPublicationActivity) {
        const documentPublicationStatus = yield documentPublicationActivity?.status;
        this.documentsAreVisible = documentPublicationStatus.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
      }
    } else {
      this.documentsAreVisible = true;
    }
  }

  @task
  *loadDocuments() {
    let pieces = yield this.throttledLoadingService.loadPieces.perform(this.args.agendaitem);
    pieces = pieces.toArray();
    let sortedPieces;
    if (this.args.agendaitem.isApproval) {
      sortedPieces = sortPieces(pieces, VrNotulenName, compareNotulen);
    } else if (this.args.meeting.isPreKaleidos) {
      sortedPieces = sortPieces(pieces, VrLegacyDocumentName, compareLegacyDocuments);
    } else {
      sortedPieces = sortPieces(pieces);
    }
    this.agendaitemDocuments = sortedPieces;
  }

  @task
  *loadDecisionActivity() {
    const treatment = yield this.args.agendaitem.treatment;
    const decisionActivity = yield treatment?.decisionActivity;
    const drc = yield decisionActivity?.decisionResultCode;
    this.isAgendaitemPostponedOrRetracted = drc?.isPostponed || drc?.isRetracted;
  }

  @dropTask
  *lazyLoadSideData() {
    yield timeout(350);
    const tasks = [
      this.loadNewsletterVisibility,
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
}
