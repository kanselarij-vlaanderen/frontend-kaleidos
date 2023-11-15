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

export default class DetailAgendaitemAgendaitemsAgendaRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');

    let pieces = await this.store.query('piece', {
      'filter[agendaitems][:id:]': agendaItem.id, // Use agendaItem.id here
      'page[size]': PAGE_SIZE.PIECES, // TODO add pagination when sorting is done in the backend
      include: 'document-container',
    });
    pieces = pieces.toArray();

    let sortedPieces;
    this.meeting = this.modelFor('agenda').meeting;
    if (agendaItem.isApproval) {
      sortedPieces = sortPieces(pieces, VrNotulenName, compareNotulen);
    } else if (this.meeting.isPreKaleidos) {
      sortedPieces = sortPieces(pieces, VrLegacyDocumentName, compareLegacyDocuments);
    } else {
      sortedPieces = sortPieces(pieces);
    }

    const agendaitem = await this.store.findRecord('agendaitem', agendaItem.id, {
      include: [
        'agenda-activity',
        'agenda-activity.subcase',
        'agenda-activity.subcase.type',
        'agenda-activity.subcase.mandatees',
        'type',
      ].join(','),
    });

    return {
      agendaitem,
      pieces: sortedPieces,
    };
  }

  async afterModel(model) {
    this.agendaActivity = await model.agendaitem.agendaActivity;
    this.subcase = await this.agendaActivity?.subcase;
    this.submitter = undefined;
    if (this.subcase) {
      this.submitter = await this.subcase.requestedBy;
      await this.subcase.governmentAreas;
    }
    const agendaItemTreatment = await model.treatment;
    this.newsItem = await agendaItemTreatment?.newsItem;
    const decisionActivity = await agendaItemTreatment?.decisionActivity;
    await decisionActivity?.decisionResultCode;
    // When routing here from agenda overview with stale data, we need to reload several relations
    // The reload in model refreshes only the attributes and includes relations, makes saves with stale relation data possible
    await model.agendaitem.hasMany('mandatees').reload();
    await model.agendaitem.hasMany('pieces').reload();
    this.mandatees = (await model.agendaitem.mandatees).sortBy('priority');

    this.agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    this.currentAgenda = await this.agendaitem.agenda;
    this.previousAgenda = await this.currentAgenda.previousVersion;
    // this.agendaActivity = await this.agendaitem.agendaActivity;
    this.treatment = await this.agendaitem.treatment;
    this.decisionActivity = await this.treatment?.decisionActivity;
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

  async setupController(controller) {
    super.setupController(...arguments);
    // modelFor('agenda') contains agenda and meeting object.
    controller.meeting = this.modelFor('agenda').meeting;
    controller.agenda = this.modelFor('agenda').agenda;
    controller.reverseSortedAgendas = this.modelFor('agenda').reverseSortedAgendas;
    controller.agendaActivity = this.agendaActivity;
    controller.subcase = this.subcase;
    controller.newsItem = this.newsItem;
    controller.mandatees = this.mandatees;
    controller.submitter = this.submitter;

    controller.agendaitem = this.agendaitem;
    controller.defaultAccessLevel = this.defaultAccessLevel;
    controller.isOpenBatchDetailsModal = false;
    controller.isOpenPieceUploadModal = false;
    controller.isOpenPublicationModal = false;
    controller.hasConfirmedDocEditOnApproved = false;
    controller.currentAgenda = this.currentAgenda;
    controller.previousAgenda = this.previousAgenda;
    // controller.agendaActivity = this.agendaActivity;
    controller.documentsAreVisible = this.documentsAreVisible;
    // controller.meeting = this.meeting;
    controller.decisionActivity = this.decisionActivity;
    controller.loadNewPieces.perform();
  }
}
