import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import VrNotulenName, {
  compareFunction as compareNotulen,
} from 'frontend-kaleidos/utils/vr-notulen-name';
import VrLegacyDocumentName,
{ compareFunction as compareLegacyDocuments } from 'frontend-kaleidos/utils/vr-legacy-document-name';

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
    pieces = pieces.toArray();
    let sortedPieces;
    this.meeting = this.modelFor('agenda').meeting;
    if (agendaitem.isApproval) {
      sortedPieces = sortPieces(pieces, VrNotulenName, compareNotulen);
    } else if (this.meeting.isPreKaleidos) {
      sortedPieces = sortPieces(pieces, VrLegacyDocumentName, compareLegacyDocuments);
    } else {
      sortedPieces = sortPieces(pieces);
    }

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
    this.defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      this.subcase?.confidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );

    // Additional failsafe check on document visibility. Strictly speaking this check
    // is not necessary since documents are not propagated by Yggdrasil if they
    // should not be visible yet for a specific profile.
    if (this.currentSession.may('view-documents-before-release')) {
      this.documentsAreVisible = true;
    } else {
      const documentPublicationActivity = await this.meeting.internalDocumentPublicationActivity;
      const documentPublicationStatus = await documentPublicationActivity?.status;
      this.documentsAreVisible = documentPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.agendaitem = this.agendaitem;
    controller.subcase = this.subcase;
    controller.defaultAccessLevel = this.defaultAccessLevel;
    controller.isOpenBatchDetailsModal = false;
    controller.isOpenPieceUploadModal = false;
    controller.isOpenPublicationModal = false;
    controller.hasConfirmedDocEditOnApproved = false;
    controller.currentAgenda = this.currentAgenda;
    controller.previousAgenda = this.previousAgenda;
    controller.agendaActivity = this.agendaActivity;
    controller.documentsAreVisible = this.documentsAreVisible;
    controller.meeting = this.meeting;
    controller.loadNewPieces.perform();
  }
}
