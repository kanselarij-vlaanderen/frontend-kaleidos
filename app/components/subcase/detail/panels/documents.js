import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { action } from '@ember/object';
import { A } from '@ember/array';

export default class SubcaseDetailPanelsDocumentsComponent extends Component {
  @tracked isOpenPieceUploadModal = false;
  @tracked documentsAreVisible = false;
  @tracked isOpenBatchDetailsModal = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked defaultAccessLevel;
  @tracked newPieces = A([]);
  
  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = this.args.subcase.governmentAreas;
    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.args.subcase.save();
    const agendaitemsOnDesignAgendaToEdit = await this.store.query(
      'agendaitem',
      {
        'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
        'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
      }
    );
    await Promise.all(
      agendaitemsOnDesignAgendaToEdit.map(async (agendaitem) => {
        setNotYetFormallyOk(agendaitem);
        return agendaitem.save();
      })
    );
  }

  @action
  async openPieceUploadModal() {
    this.isOpenPieceUploadModal = true;
  }

  @task
  *handleSubmittedPieces(pieces) {
    yield this.ensureFreshData.perform();

    // Attach pieces to submission activity and on open agendaitem (if any)
    const agendaActivity = yield this.getAgendaActivity.perform();
    if (agendaActivity) {
      // Item is already on open agenda; adding extra pieces
      yield this.createSubmissionActivity.perform(pieces, agendaActivity);
      yield this.updateRelatedAgendaitems.perform(pieces);
    } else {
      // Preparing pieces for subcase that is not yet on agenda
      yield this.updateSubmissionActivity.perform(pieces);
    }
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

  @action
  uploadPiece(file) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: this.args.subcase.confidential || false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
      cases: [this.args.case],
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
    yield this.handleSubmittedPieces.perform(this.newPieces);
    this.isOpenPieceUploadModal = false;
    this.newPieces = A();
    this.router.refresh('cases.case.subcases.subcase');
  }

  /**
   * Save a new document container and the piece it wraps
   */
  @task
  *savePiece(piece) {
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    piece.name = piece.name.trim();
    yield piece.save();
    try {
      const sourceFile = yield piece.file;
      yield this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title')
      );
    }
  }

  /**
   * Add new piece to an existing document container
   */
  @task
  *addPiece(piece) {
    piece.cases.pushObject(this.args.case);
    yield piece.save();
    yield this.pieceAccessLevelService.updatePreviousAccessLevel(piece);
    try {
      const sourceFile = yield piece.file;
      yield this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title')
      );
    }
    yield this.handleSubmittedPieces.perform([piece]);
    this.router.refresh('cases.case.subcases.subcase');
  }
}
