import Controller from '@ember/controller';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask, task } from 'ember-concurrency';
import { all, timeout } from 'ember-concurrency';
import moment from 'moment';
import {
  addPieceToAgendaitem,
  restorePiecesFromPreviousAgendaitem,
} from 'frontend-kaleidos/utils/documents';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import { isEmpty, isPresent } from '@ember/utils';
import ENV from 'frontend-kaleidos/config/environment';

export default class DocumentsAgendaitemsAgendaController extends Controller {
  @service currentSession;
  @service intl;
  @service store;
  @service agendaService;
  @service signatureService;

  documentsAreVisible;
  defaultAccessLevel;
  @tracked isOpenBatchDetailsModal = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenPublicationModal = false;
  @tracked newPieces = A([]);
  @tracked newAgendaitemPieces;
  @tracked agendaitem;
  @tracked currentAgenda;
  @tracked previousAgenda;
  @tracked agendaActivity;

  get isShownOpenPublicationModal() {
    const mayPublish = this.currentSession.may('manage-publication-flows');
    const hasCase = isPresent(this.agendaActivity);
    const hasPieces = isPresent(this.model.pieces);
    return mayPublish && hasCase && hasPieces;
  }

  get isShownSignatureMarker() {
    const isEnabled = !isEmpty(ENV.APP.ENABLE_SIGNATURES);
    const hasPermission = this.currentSession.may('manage-signatures');
    return isEnabled && hasPermission;
  }

  @task
  *loadNewPieces() {
    if (this.previousAgenda) {
      this.newAgendaitemPieces = yield this.agendaService.changedPieces(
        this.currentAgenda.id,
        this.previousAgenda.id,
        this.agendaitem.id
      );
    }
  }

  @action
  async openPieceUploadModal() {
    await this.ensureFreshData.perform();
    this.isOpenPieceUploadModal = true;
  }

  @action
  uploadPiece(file) {
    const now = moment().utc().toDate();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    this.newPieces.pushObject(piece);
  }

  @task
  *savePieces() {
    const savePromises = this.newPieces.map(async (piece) => {
      try {
        await this.savePiece.perform(piece);
      } catch (error) {
        await this.deletePiece.perform(piece);
        throw error;
      }
    });
    yield all(savePromises);
    yield this.updateRelatedAgendaitemsAndSubcase.perform(this.newPieces);
    this.isOpenPieceUploadModal = false;
    this.newPieces = A();
  }

  /**
   * Save a new document container and the piece it wraps
   */
  @task
  *savePiece(piece) {
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    yield piece.save();
  }

  /**
   * Add new piece to an existing document container
   */
  @task
  *addPiece(piece) {
    yield piece.save();
    yield this.updateRelatedAgendaitemsAndSubcase.perform([piece]);
  }

  @task
  *cancelUploadPieces() {
    const deletePromises = this.newPieces.map((piece) =>
      this.deletePiece.perform(piece)
    );
    yield all(deletePromises);
    this.newPieces = A();
    this.isOpenPieceUploadModal = false;
  }

  @task
  *deletePiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    this.newPieces.removeObject(piece);
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  @keepLatestTask
  *ensureFreshData() {
    yield this.agendaitem.preEditOrSaveCheck();
  }

  @action
  async setPreviousPiecesFromAgendaitem(deletedPiece) {
    // TODO: Assess if we need to go over container. `previousVersion` (if existant) might suffice?
    const documentContainer = await deletedPiece.documentContainer;
    if (documentContainer) {
      const pieces = documentContainer.pieces;
      if (this.agendaitem && pieces.length > 0) {
        await restorePiecesFromPreviousAgendaitem(this.agendaitem, documentContainer);
        // TODO: make sure we're not loading stale cache
      }
      this.refresh();
    }
  }

  @task
  *updateRelatedAgendaitemsAndSubcase(pieces) {
    yield this.ensureFreshData.perform(); // some other user could have saved agendaitem before we pressed save
    // Failsafe, if we got to a situation where the user has old pieces data when saving new pieces, we refresh the relation to avoid stale data
    // The improved concurrency check should be enough, but as long as we save here, the risk of saving old data exists
    yield this.agendaitem.hasMany('pieces').reload();
    // Link pieces to subcase with activity
    const agendaActivity = yield this.agendaitem.agendaActivity;
    if (agendaActivity) {
      // There is no agendaActivity/subcase on isApproval agendaitems
      const subcase = yield agendaActivity.subcase;
      // Create new submission activity for pieces added after initial submission
      const submissionActivity = this.store.createRecord(
        'submission-activity',
        {
          startDate: new Date(),
          subcase,
          agendaActivity,
          pieces,
        }
      );
      submissionActivity.save(); // submission-act isn't needed further here. No yield. Can run in background.
    }

    // save formal ok change on agendaitem
    // If the concurrency check failed you can overwrite the pieces list with stale data, effectively losing piece links to agendaitem
    setNotYetFormallyOk(this.agendaitem);
    yield this.agendaitem.save();

    // Link piece to agendaitem
    for (const piece of pieces) {
      yield addPieceToAgendaitem(this.agendaitem, piece);
    }
    // ensure the cache does not hold stale data + refresh our local store for future saves of agendaitem
    for (let index = 0; index < 10; index++) {
      const agendaitemPieces = yield this.agendaitem.hasMany('pieces').reload();
      if (agendaitemPieces.includes(pieces[pieces.length - 1])) {
        // last added piece was found in the list from cache
        this.send('reloadModel');
        break;
      } else {
        // list from cache is stale, wait with back-off strategy
        yield timeout(500 + index * 500);
        if (index >= 9) {
          this.toaster.error(
            this.intl.t('documents-may-not-be-saved-message'),
            this.intl.t('warning-title'),
            {
              timeOut: 60000,
            }
          );
        }
      }
    }
  }

  @action
  async openBatchDetails() {
    await this.ensureFreshData.perform();
    this.isOpenBatchDetailsModal = true;
  }

  @action
  cancelBatchDetails() {
    this.isOpenBatchDetailsModal = false;
  }

  @action
  saveBatchDetails() {
    this.isOpenBatchDetailsModal = false;
    this.refresh();
  }

  @action
  openPublicationModal() {
    this.isOpenPublicationModal = true;
  }

  @action
  closePublicationModal() {
    this.isOpenPublicationModal = false;
  }

  @action
  async markForSignature(piece) {
    // Placed the getting of these variables here to lessen loading time in router
    const agendaItemTreatment = await this.agendaitem.treatment;
    const decisionActivity = await agendaItemTreatment.decisionActivity;
    await this.signatureService.markDocumentForSignature(piece, decisionActivity);
  }

  @action
  async unmarkForSignature(piece) {
    await this.signatureService.unmarkDocumentForSignature(piece);
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
