import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

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

    this.showDocumentsAreVisibleAlert = false;
    // Additional failsafe check on document visibility.
    // retracted and postponed documents are hidden for non admin because
    // we cannot match the "historic name" of the documents due to resubmitting
    const decisionPublicationActivity = await this.meeting.internalDecisionPublicationActivity;
    const decisionPublicationStatus = await decisionPublicationActivity?.status;
    const decisionsAreReleased = decisionPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;

    const documentPublicationActivity = await this.meeting.internalDocumentPublicationActivity;
    const documentPublicationStatus = await documentPublicationActivity?.status;
    const documentsAreReleased = documentPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
    const decisionActivityResultCode = await this.decisionActivity?.decisionResultCode;

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
    controller.hasConfirmedDocEditOnApproved = false;
    controller.currentAgenda = this.currentAgenda;
    controller.previousAgenda = this.previousAgenda;
    controller.agendaActivity = this.agendaActivity;
    controller.documentsAreVisible = this.documentsAreVisible;
    controller.showDocumentsAreVisibleAlert = this.showDocumentsAreVisibleAlert;
    controller.meeting = this.meeting;
    controller.decisionActivity = this.decisionActivity;
    controller.loadNewPieces.perform();
  }
}
