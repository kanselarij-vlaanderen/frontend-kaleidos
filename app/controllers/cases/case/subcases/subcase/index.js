import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import {
  keepLatestTask,
  task,
  all,
} from 'ember-concurrency';
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
      setNotYetFormallyOk(agendaitem);
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
    const confidential = this.model.subcase.confidential || false;
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

  @task
  *savePieces() {
    // enforce all new pieces must have type on document container
    const typesPromises = this.newPieces.map(async (piece) => {
      const container = await piece.documentContainer;
      const type = await container.type;
      return type;
    });
    const types = yield all(typesPromises);
    if (types.some(type => !type)) {
      this.toaster.error(
        this.intl.t('document-type-required'),
        this.intl.t('warning-title'),
      );
      return;
    }

    const savePromises = this.sortedNewPieces.map(async(piece, index) => {
      try {
        await this.savePiece.perform(piece, index);
      } catch (error) {
        await this.deletePiece.perform(piece);
        throw error;
      }
    });
    yield all(savePromises);
    yield this.handleSubmittedPieces.perform(this.newPieces);
    this.isOpenPieceUploadModal = false;
    this.newPieces = new TrackedArray([]);
    this.router.refresh('cases.case.subcases.subcase');
  }

  /**
   * Save a new document container and the piece it wraps
  */
  @task
  *savePiece(piece, index) {
    const documentContainer = yield piece.documentContainer;
    documentContainer.position = index + 1 + (this.model.pieces?.length ?? 0);
    yield documentContainer.save();
    piece.name = piece.name.trim();
    yield piece.save();
    try {
      const sourceFile = yield piece.file;
      yield this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
  }

  /**
   * Add new piece to an existing document container
  */
  @task
  *addPiece(piece) {
    // TODO KAS-4104 WHY DO WE ADD case to piece.cases, we have a service that does this automatically. This is asking for concurrency issues
    // const cases = yield piece.cases;
    // cases.push(this.case);
    yield piece.save();
    yield this.pieceAccessLevelService.updatePreviousAccessLevel(piece);
    try {
      const sourceFile = yield piece.file;
      yield this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
    yield this.handleSubmittedPieces.perform([piece]);
    this.router.refresh('cases.case.subcases.subcase');
  }

  @task
  *cancelUploadPieces() {
    const deletePromises = this.newPieces.map((piece) => this.deletePiece.perform(piece));
    yield all(deletePromises);
    this.newPieces = new TrackedArray([]);
    this.isOpenPieceUploadModal = false;
  }

  @task
  *deletePiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    removeObject(this.newPieces, piece);
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  @keepLatestTask
  *ensureFreshData() {
    // piece is linked to a case at the piece-side,
    // so we don't need to reload this.model._case and this.model._case.pieces

    // we don't need to reload the subcase because we don't need to save it
    // Pieces are added on a submission activity, instead of directly on the subcase
    // Submission activities are related to subcase by means of the inverse relation

    // we don't need to reload subcase.agendaActivities nor subcase.submissionActivities
    // since we query them from the backend on addition of new pieces
  }

  @task
  *handleSubmittedPieces(pieces) {
    yield this.ensureFreshData.perform();

    // Attach pieces to submission activity and on open agendaitem (if any)
    const agendaActivity = yield this.pieceUpload.getAgendaActivity(this.model.subcase);
    if (agendaActivity) { // Item is already on open agenda; adding extra pieces
      yield this.pieceUpload.createSubmissionActivity(pieces, this.model.subcase, agendaActivity);
      yield this.updateRelatedAgendaitems.perform(pieces);
    } else { // Preparing pieces for subcase that is not yet on agenda
      yield this.pieceUpload.updateSubmissionActivity(pieces, this.model.subcase);
    }
  }

  @task
  *updateRelatedAgendaitems(pieces) {
    yield this.pieceUpload.updateRelatedAgendaitems.perform(
      pieces,
      this.model.subcase
    );
    this.router.refresh('cases.case.subcases.subcase');
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
    this.router.refresh('cases.case.subcases.subcase');
    this.isOpenBatchDetailsModal = false;
  }

  @action
  refresh() {
    this.router.refresh('cases.case.subcases.subcase');
  }
}
