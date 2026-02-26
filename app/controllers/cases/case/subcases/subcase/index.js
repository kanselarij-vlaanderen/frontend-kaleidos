import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { task, all } from 'ember-concurrency';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';
import { findDocType } from 'frontend-kaleidos/utils/document-type';

export default class CasesCaseSubcasesSubcaseIndexController extends Controller {
  @service agendaitemAndSubcasePropertiesSync;
  @service store;
  @service intl;
  @service router;
  @service fileConversionService;
  @service toaster;
  @service pieceAccessLevelService;
  @service conceptStore;
  @service pieceUpload;
  @service documentService;

  @tracked decisionmakingFlow;
  @tracked mandatees;
  @tracked submitter;
  @tracked meeting;
  @tracked agenda;

  @tracked isOpenPieceUploadModal = false;

  @tracked documentsAreVisible = false;
  @tracked isOpenBatchDetailsModal = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked defaultAccessLevel;
  @tracked newPieces = new TrackedArray([]);
  @tracked piecesNotOnAgenda;

  get sortedNewPieces() {
    return this.newPieces.slice().sort((p1, p2) => {
      const d1 = p1.belongsTo('documentContainer').value();
      const d2 = p2.belongsTo('documentContainer').value();

      return d1.position - d2.position || p1.created - p2.created;
    });
  }


  @action
  async saveMandateeData(mandateeData) {
    const propertiesToSetOnAgendaitem = {
      mandatees: mandateeData.mandatees,
    };
    const propertiesToSetOnSubcase = {
      mandatees: mandateeData.mandatees,
      requestedBy: mandateeData.submitter,
    };
    this.mandatees = mandateeData.mandatees;
    this.submitter = mandateeData.submitter;
    await this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.model.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      true,
    );
  }

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    this.model.subcase.governmentAreas = newGovernmentAreas;
    await this.model.subcase.save();
    const agendaitemsOnDesignAgendaToEdit = await this.store.query('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.model.subcase.id,
      'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
    });
    await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async (agendaitem) => {
      return agendaitem.save();
    }));
  }

  @action
  async openPieceUploadModal() {
    this.isOpenPieceUploadModal = true;
  }

  @action
  async uploadPiece(file) {
    const name = file.filenameWithoutExtension;
    const parsed = new VRCabinetDocumentName(name).parsed;
    const type = await findDocType(this.conceptStore, parsed.type);

    const now = new Date();
    const confidential =
      parsed.confidential || this.model.subcase.confidential || false;
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
      position: parsed.index,
      type,
    });
    this.defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      confidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: confidential,
      name: parsed.subject,
      documentContainer: documentContainer,
      cases: [this.model._case],
    });
    this.newPieces.push(piece);
  }

  savePieces = task(async () => {
    const typesRequired = await this.documentService.enforceDocType(this.newPieces);
    if (typesRequired) return;

    const savePromises = this.sortedNewPieces.map(async(piece, index) => {
      try {
        await this.savePiece.perform(piece, index);
      } catch (error) {
        await this.deletePiece.perform(piece);
        throw error;
      }
    });
    await all(savePromises);
    await this.handleSubmittedPieces.perform(this.newPieces);
    this.isOpenPieceUploadModal = false;
    this.newPieces = new TrackedArray([]);
    this.router.refresh('cases.case.subcases.subcase');
  });

  /**
   * Save a new document container and the piece it wraps
  */
  savePiece = task(async (piece, index) => {
    const documentContainer = await piece.documentContainer;
    const containerCount = await this.store.count('document-container', {
      'filter[pieces][submission-activities][subcase][id]': this.model.subcase.id,
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
    // TODO KAS-4104 WHY DO WE ADD case to piece.cases, we have a service that does this automatically. This is asking for concurrency issues
    // const cases = await piece.cases;
    // cases.push(this.case);
    await piece.save();
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
    await this.handleSubmittedPieces.perform([piece]);
    this.router.refresh('cases.case.subcases.subcase');
  });

  cancelUploadPieces = task(async () => {
    const deletePromises = this.newPieces.map((piece) => this.deletePiece.perform(piece));
    await all(deletePromises);
    this.newPieces = new TrackedArray([]);
    this.isOpenPieceUploadModal = false;
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
    // piece is linked to a case at the piece-side,
    // so we don't need to reload this.model._case and this.model._case.pieces

    // we don't need to reload the subcase because we don't need to save it
    // Pieces are added on a submission activity, instead of directly on the subcase
    // Submission activities are related to subcase by means of the inverse relation

    // we don't need to reload subcase.agendaActivities nor subcase.submissionActivities
    // since we query them from the backend on addition of new pieces
  });

  handleSubmittedPieces = task(async (pieces) => {
    await this.ensureFreshData.perform();

    // Attach pieces to submission activity and on open agendaitem (if any)
    const agendaActivity = await this.pieceUpload.getAgendaActivity(this.model.subcase);
    if (agendaActivity) { // Item is already on open agenda; adding extra pieces
      await this.pieceUpload.createSubmissionActivity(pieces, this.model.subcase, agendaActivity);
      await this.updateRelatedAgendaitems.perform(pieces);
    } else { // Preparing pieces for subcase that is not yet on agenda
      await this.pieceUpload.updateSubmissionActivity(pieces, this.model.subcase);
    }
  });

  updateRelatedAgendaitems = task(async (pieces) => {
    await this.pieceUpload.updateRelatedAgendaitems.perform(
      pieces,
      this.model.subcase
    );
    this.router.refresh('cases.case.subcases.subcase');
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
    this.router.refresh('cases.case.subcases.subcase');
    this.isOpenBatchDetailsModal = false;
  }

  @action
  refresh() {
    this.router.refresh('cases.case.subcases.subcase');
  }

  @action
  refreshSubcases(decisionmakingFlow) {
    this.router.refresh('cases.case');
    if (decisionmakingFlow?.id) {
      this.router.transitionTo('cases.case.index', decisionmakingFlow.id);
    }
  }
}
