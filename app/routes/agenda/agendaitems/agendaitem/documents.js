import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TrackedArray } from 'tracked-built-ins';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class DocumentsAgendaitemAgendaitemsAgendaRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    // This uses the same call as in others routes/components, ensuring we hit the same cache
    let pieces = await this.store.query('piece', {
      'filter[agendaitems][:id:]': agendaitem.id,
      'page[size]': PAGE_SIZE.PIECES, // TODO add pagination when sorting is done in the backend
      include: 'document-container',
    });
    pieces = pieces.slice();
    this.meeting = this.modelFor('agenda').meeting;
    const sortedPieces = await sortPieces(
      pieces,
      {
        isApproval: agendaitem.isApproval,
        isPreKaleidos: this.meeting.isPreKaleidos,
      }
    );

    return {
      pieces: sortedPieces,
      // linkedPieces: this.modelFor('agenda.agendaitems.agendaitem').get('linkedPieces')
    };
  }

  async afterModel() {
    this.agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    this.currentAgenda = await this.agendaitem.agenda;
    this.previousAgenda = await this.currentAgenda.previousVersion;
    this.agendaActivity = await this.agendaitem.agendaActivity;
    this.subcase = await this.agendaActivity?.subcase;
    this.treatment = await this.agendaitem.treatment;
    this.decisionActivity = await this.treatment?.decisionActivity;
    this.confidentialAccessLevel = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
    );
    this.defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      this.subcase?.confidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );

    // need at least 1 file before we show the download button
    this.hasFilesToDownload = (await this.store.count('piece', {
      'filter[agendaitems][:id:]': this.agendaitem.id,
      'filter[:has:file]': true,
    })) > 0;

    this.showDocumentsAreVisibleAlert = false;
    // Additional failsafe check on document visibility.
    // retracted and postponed documents are hidden for non admin because
    // we cannot match the "historic name" of the documents due to resubmitting
    const decisionPublicationActivity = await this.meeting.belongsTo('internalDecisionPublicationActivity').reload();
    const decisionPublicationStatus = await decisionPublicationActivity?.belongsTo('status').reload();
    const decisionsAreReleased = decisionPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;

    const documentPublicationActivity = await this.meeting.belongsTo('internalDocumentPublicationActivity').reload();
    const documentPublicationStatus = await documentPublicationActivity?.belongsTo('status').reload();
    const documentsAreReleased = documentPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
    const decisionActivityResultCode = await this.decisionActivity?.belongsTo('decisionResultCode').reload();

    if (!decisionsAreReleased || this.currentAgenda.status.get('isDesignAgenda')) {
      this.documentsAreVisible = this.currentSession.may('view-documents-before-release');
      return;
    }

    // decisionsAreReleased
    const { INGETROKKEN, UITGESTELD } = CONSTANTS.DECISION_RESULT_CODE_URIS;
    if ([INGETROKKEN, UITGESTELD].includes(decisionActivityResultCode?.uri)) {
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
    if ([GOEDGEKEURD, KENNISNAME].includes(decisionActivityResultCode?.uri)) {
      this.documentsAreVisible = true;
      return;
    }
    // no decisionResult after release
    this.documentsAreVisible = this.currentSession.may('view-documents-before-release');

    // any legacy has no decisionResultCode, the document access level will determine who can view
    if (this.meeting.isPreKaleidos) {
      this.documentsAreVisible = true;
    }
    return;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.agendaitem = this.agendaitem;
    controller.subcase = this.subcase;
    controller.defaultAccessLevel = this.defaultAccessLevel;
    controller.confidentialAccessLevel = this.confidentialAccessLevel;
    controller.isOpenBatchDetailsModal = false;
    controller.isOpenPieceUploadModal = false;
    controller.isOpenPublicationModal = false;
    controller.isOpenSignFlowModal = false;
    controller.isOpenWarnDocEditOnApproved = false;
    controller.hasConfirmedDocEditOnApproved = false;
    controller.currentAgenda = this.currentAgenda;
    controller.previousAgenda = this.previousAgenda;
    controller.agendaActivity = this.agendaActivity;
    controller.documentsAreVisible = this.documentsAreVisible;
    controller.showDocumentsAreVisibleAlert = this.showDocumentsAreVisibleAlert;
    controller.meeting = this.meeting;
    controller.decisionActivity = this.decisionActivity;
    controller.hasFilesToDownload = this.hasFilesToDownload;
    controller.loadNewPieces.perform();
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      // cleanup any unsaved pieces
      Promise.all(
        controller.newPieces.map(async (piece) => {
          if (!piece?.id) {
            // don't delete the draft-piece here.
            await deletePiece(piece, false);
          }
        }),
      ).then(() => (controller.newPieces = new TrackedArray([])));
    }
  }
}
