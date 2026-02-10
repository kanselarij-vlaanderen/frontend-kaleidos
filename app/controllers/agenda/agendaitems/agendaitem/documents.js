import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { task, all, timeout } from 'ember-concurrency';
import {
  addPieceToAgendaitem,
  restorePiecesFromPreviousAgendaitem,
} from 'frontend-kaleidos/utils/documents';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import { isPresent } from '@ember/utils';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';
import { findDocType } from 'frontend-kaleidos/utils/document-type';

export default class DocumentsAgendaitemsAgendaController extends Controller {
  @service currentSession;
  @service documentService;
  @service intl;
  @service toaster;
  @service store;
  @service agendaService;
  @service fileConversionService;
  @service router;
  @service pieceAccessLevelService;
  @service signatureService;
  @service conceptStore;
  @service documentService;

  documentsAreVisible;
  showDocumentsAreVisibleAlert;
  defaultAccessLevel;
  meeting;
  hasFilesToDownload;

  @tracked isOpenBatchDetailsModal = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenPublicationModal = false;
  @tracked isOpenSignFlowModal = false;
  @tracked isOpenWarnDocEditOnApproved = false;
  @tracked hasConfirmedDocEditOnApproved = false;
  @tracked isOpenDownloadDocumentsModal = false;

  @tracked newPieces = new TrackedArray([]);
  @tracked newAgendaitemPieces;
  @tracked agendaitem;
  @tracked currentAgenda;
  @tracked previousAgenda;
  @tracked agendaActivity;
  @tracked subcase;
  @tracked decisionActivity;

  get archivePath() {
    return `/agendaitems/${this.agendaitem.id}/pieces/files/archive`;
  }

  get isShownOpenPublicationModal() {
    const mayPublish = this.currentSession.may('manage-publication-flows');
    const hasCase = isPresent(this.agendaActivity);
    const hasPieces = isPresent(this.model.pieces);
    return mayPublish && hasCase && hasPieces;
  }

  get hideAccessLevel() {
    if (this.decisionActivity &&
      ((this.decisionActivity.isRetracted ||
        this.decisionActivity.isPostponed) &&
        !this.currentSession.may('view-access-level-pill-when-postponed'))
    ) {
      return true;
    }
    return false;
   }

  get sortedNewPieces() {
    return this.newPieces.slice().sort((p1, p2) => {
      const d1 = p1.belongsTo('documentContainer').value();
      const d2 = p2.belongsTo('documentContainer').value();

      return d1.position - d2.position || p1.created - p2.created;
    });
  }

  loadNewPieces = task(async () => {
    if (this.previousAgenda) {
      this.newAgendaitemPieces = await this.agendaService.changedPieces(
        this.currentAgenda.id,
        this.previousAgenda.id,
        this.agendaitem.id
      );
    }
  });

  @action
  async openPieceUploadModal() {
    await this.ensureFreshData.perform();
    const canDocsBeEdited = await this.checkIfDocumentsCanBeEdited();
    if (canDocsBeEdited) {
      this.isOpenPieceUploadModal = true;
    }
  }

  @action
  async openUploadModalForNewPiece() {
    await this.ensureFreshData.perform();
    const canDocsBeEdited = await this.checkIfDocumentsCanBeEdited();
    if (canDocsBeEdited) {
      return true;
    }
    return false;
  }

  @action
  async checkIfDocumentsCanBeEdited() {
    const agendaStatus = await this.currentAgenda.belongsTo('status').reload();
    const isAgendaDraftOrLegacy = agendaStatus.isDesignAgenda || this.meeting.isPreKaleidos;
    if (!isAgendaDraftOrLegacy) {
      await this.currentAgenda.belongsTo('nextVersion').reload();
      await this.openWarnUploadOnApproved.perform();
    }
    return isAgendaDraftOrLegacy || this.hasConfirmedDocEditOnApproved;
  }

  openWarnUploadOnApproved = task(async () => {
    this.isOpenWarnDocEditOnApproved = true;
    this.hasConfirmedDocEditOnApproved = false;
    // The user has about 60 seconds to confirm
    for (let index = 0; index < 120; index++) {
      if (this.isOpenWarnDocEditOnApproved) {
        await timeout(500);
      }
    }
    this.isOpenWarnDocEditOnApproved = false;
  });

  @action
  closeWarnDocEditOnApproved() {
    this.isOpenWarnDocEditOnApproved = false;
    this.hasConfirmedDocEditOnApproved = false;
  }

  @action
  confirmDocEditOnApproved() {
    this.isOpenWarnDocEditOnApproved = false;
    this.hasConfirmedDocEditOnApproved = true;
  }

  @action
  async uploadPiece(file) {
    const name = file.filenameWithoutExtension;
    const parsed = new VRCabinetDocumentName(name).parsed;
    const type = await findDocType(this.conceptStore, parsed.type);
    
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
      position: parsed.index,
      type,
    });
    const accessLevel = parsed.confidential
      ? this.confidentialAccessLevel
      : this.defaultAccessLevel;
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file,
      accessLevel,
      name: parsed.subject,
      documentContainer: documentContainer,
    });
    this.newPieces.push(piece);
  }

  savePieces = task(async () => {
    const typesRequired = await this.documentService.enforceDocType(this.newPieces);
    if (typesRequired) return;

    const savePromises = this.sortedNewPieces.map(async (piece, index) => {
      try {
        await this.savePiece.perform(piece, index);
      } catch (error) {
        await this.deletePiece.perform(piece);
        throw error;
      }
    });
    await all(savePromises);
    await this.updateRelatedAgendaitemsAndSubcase.perform(this.newPieces);
    const agendaStatus = await this.currentAgenda.status;
    if (agendaStatus.isApproved) {
      await this.documentService.stampDocuments(
        this.newPieces
      );
    }
    this.isOpenPieceUploadModal = false;
    this.newPieces = new TrackedArray([]);
  });

  /**
   * Save a new document container and the piece it wraps
   */
  savePiece = task(async (piece, index) => {
    const documentContainer = await piece.documentContainer;
    const containerCount = await this.store.count('document-container', {
      'filter[pieces][agendaitems][id]': this.agendaitem.id,
    });
    documentContainer.position = index + 1 + (containerCount ?? 0);
    await documentContainer.save();
    piece.name = piece.name.trim();
    await piece.save();
    try {
      const sourceFile = await piece.file;
      await this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
  });

  /**
   * Add new piece to an existing document container
   */
  addPiece = task(async (piece) => {
    await piece.save();
    await this.signatureService.markNewPieceForSignature(null, piece, this.decisionActivity);
    await this.pieceAccessLevelService.updatePreviousAccessLevel(piece);
    try {
      const sourceFile = await piece.file;
      await this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }

    // Stamp the new piece if needed
    if (this.model.pieces.some(piece => piece.stamp)) {
      const previousPiece = await piece.previousPiece;
      if (previousPiece.stamp) {
        await this.documentService.stampDocuments([piece]);
      }
    }
    await this.updateRelatedAgendaitemsAndSubcase.perform([piece]);
  });

  cancelUploadPieces = task(async () => {
    const deletePromises = this.newPieces.map((piece) =>
      this.deletePiece.perform(piece)
    );
    await all(deletePromises);
    this.newPieces = new TrackedArray([]);
    this.isOpenPieceUploadModal = false;
  });

  cancelAddPiece = task(async (piece) => {
    const file = await piece.file;
    await file.destroyRecord();
    await piece.destroyRecord();
  });

  deletePiece = task(async (piece) => {
    const file = await piece.file;
    await file.destroyRecord();
    removeObject(this.newPieces, piece);
    const documentContainer = await piece.documentContainer;
    await documentContainer.destroyRecord();
    await piece.destroyRecord();
  });

  ensureFreshData = task({ keepLatest: true }, async () => {
    await this.agendaitem.preEditOrSaveCheck();
  });

  @action
  async setPreviousPiecesFromAgendaitem(previousPiece) {
    const documentContainer = await previousPiece?.documentContainer;
    if (documentContainer) {
      const pieces = documentContainer.pieces;
      if (this.agendaitem && pieces.length > 0) {
        await restorePiecesFromPreviousAgendaitem(this.agendaitem, documentContainer);
        // TODO: make sure we're not loading stale cache
      }
    }
  }

  updateRelatedAgendaitemsAndSubcase = task(async (pieces) => {
    await this.ensureFreshData.perform(); // some other user could have saved agendaitem before we pressed save
    if (!this.hasConfirmedDocEditOnApproved) {
      const canDocsBeEdited = await this.checkIfDocumentsCanBeEdited();
      if (!canDocsBeEdited) {
        // delete without a warning, upload not allowed or confirmed
        if (this.newPieces.length) {
          await this.cancelUploadPieces.perform();
        } else {
          const deletePromises = pieces.map(async (piece) => {
            await this.cancelAddPiece.perform(piece);
          });
          await all(deletePromises);
        }
        return;
      }
    }

    // Failsafe, if we got to a situation where the user has old pieces data when saving new pieces, we refresh the relation to avoid stale data
    // The improved concurrency check should be enough, but as long as we save here, the risk of saving old data exists
    await this.agendaitem.hasMany('pieces').reload();
    // Link pieces to subcase with activity
    const agendaActivity = await this.agendaitem.agendaActivity;
    if (agendaActivity) {
      // There is no agendaActivity/subcase on isApproval agendaitems
      const subcase = await agendaActivity.subcase;
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
      submissionActivity.save(); // submission-act isn't needed further here. No await. Can run in background.
    }

    // save formal ok change on agendaitem
    // If the concurrency check failed you can overwrite the pieces list with stale data, effectively losing piece links to agendaitem
    setNotYetFormallyOk(this.agendaitem);
    await this.agendaitem.save();

    // Link piece to agendaitem
    for (const piece of pieces) {
      await addPieceToAgendaitem(this.agendaitem, piece);
    }
    // ensure the cache does not hold stale data + refresh our local store for future saves of agendaitem
    for (let index = 0; index < 10; index++) {
      const agendaitemPieces = await this.agendaitem.hasMany('pieces').reload();
      if (agendaitemPieces.includes(pieces[pieces.length - 1])) {
        // last added piece was found in the list from cache
        this.router.refresh('agenda.agendaitems.agendaitem.documents');
        break;
      } else {
        // list from cache is stale, wait with back-off strategy
        await timeout(500 + index * 500);
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
  });

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
    this.router.refresh('agenda.agendaitems.agendaitem.documents');
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
  refresh() {
    this.router.refresh('agenda.agendaitems.agendaitem.documents');
  }

  openDownloadDocumentsModal = () => {
    this.isOpenDownloadDocumentsModal = true;
  }
  
  closeDownloadDocumentsModal = () => {
    this.isOpenDownloadDocumentsModal = false;
  }
}
