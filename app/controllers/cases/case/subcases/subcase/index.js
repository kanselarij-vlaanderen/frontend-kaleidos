import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { A } from '@ember/array';
import {
  keepLatestTask,
  task,
  all,
  timeout
} from 'ember-concurrency';
import { addPieceToAgendaitem } from 'frontend-kaleidos/utils/documents';

export default class CasesCaseSubcasesSubcaseIndexController extends Controller {
  @service agendaitemAndSubcasePropertiesSync;
  @service store;
  @service intl;
  @service router;
  @service fileConversionService;
  @service toaster;
  @service pieceAccessLevelService;

  @tracked decisionmakingFlow;
  @tracked mandatees;
  @tracked submitter;
  @tracked meeting;
  @tracked agenda;

  @tracked isOpenPieceUploadModal = false;
  @tracked defaultAccessLevel

  @tracked defaultAccessLevel;
  @tracked documentsAreVisible = false;
  @tracked isOpenBatchDetailsModal = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked defaultAccessLevel;
  @tracked newPieces = A([]);

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
    const governmentAreas = this.model.subcase.governmentAreas;
    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
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
      confidential: this.model.subcase.confidential || false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
      cases: [this.model._case],
    });
    this.newPieces.pushObject(piece);
  }

  @task
  *savePieces() {
    const savePromises = this.newPieces.map(async(piece) => {
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
        this.intl.t('warning-title'),
      );
    }
  }

  /**
   * Add new piece to an existing document container
  */
  @task
  *addPiece(piece) {
    piece.cases.pushObject(this.model._case);
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
    const agendaActivity = yield this.getAgendaActivity.perform();
    if (agendaActivity) { // Item is already on open agenda; adding extra pieces
      yield this.createSubmissionActivity.perform(pieces, agendaActivity);
      yield this.updateRelatedAgendaitems.perform(pieces);
    } else { // Preparing pieces for subcase that is not yet on agenda
      yield this.updateSubmissionActivity.perform(pieces);
    }
  }

  @task
  *getAgendaActivity() {
    const latestAgendaActivity = yield this.store.queryOne('agenda-activity', {
      'filter[subcase][:id:]': this.model.subcase.id,
      'filter[agendaitems][agenda][created-for][:has-no:agenda]': true,
      sort: '-start-date',
    });

    return latestAgendaActivity;
  }

  @task
  *createSubmissionActivity(pieces, agendaActivity = null) {
    let submissionActivity = this.store.createRecord('submission-activity', {
      startDate: new Date(),
      subcase: this.model.subcase,
      pieces,
      agendaActivity,
    });

    submissionActivity = yield submissionActivity.save();
    return submissionActivity;
  }

  @task
  *updateSubmissionActivity(pieces) {
    const submissionActivity = yield this.store.queryOne('submission-activity', {
      'filter[subcase][:id:]': this.model.subcase.id,
      'filter[:has-no:agenda-activity]': true,
    });

    if (submissionActivity) { // Adding pieces to existing submission activity
      const submissionPieces = yield submissionActivity.pieces;
      submissionPieces.pushObjects(pieces);

      yield submissionActivity.save();
      return submissionActivity;
    } else { // Create first submission activity to add pieces on
      return this.createSubmissionActivity.perform(pieces);
    }
  }

  @task
  *updateRelatedAgendaitems(pieces) {
    // Link piece to all agendaitems that are related to the subcase via an agendaActivity
    // and related to an agenda in the design status
    const agendaitems = yield this.store.query('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.model.subcase.id,
      'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
    });

    // agendaitems can only have more than 1 item
    // in case the subcase is on multiple (future) open agendas
    for (const agendaitem of agendaitems.slice()) {
      setNotYetFormallyOk(agendaitem);
      // save prior to adding pieces, micro-service does all the changes with docs
      yield agendaitem.save();
      for (const piece of pieces) {
        yield addPieceToAgendaitem(agendaitem, piece);
      }
      // ensure the cache does not hold stale data + refresh our local store for future saves of agendaitem
      for (let index = 0; index < 10; index++) {
        const agendaitemPieces = yield agendaitem.hasMany('pieces').reload();
        if (agendaitemPieces.includes(pieces[pieces.length - 1])) {
          // last added piece was found in the list from cache
          break;
        } else {
          // list from cache is stale, wait with back-off strategy
          yield timeout(500 + (index * 500));
          if (index >= 9) {
            this.toaster.error(this.intl.t('documents-may-not-be-saved-message'), this.intl.t('warning-title'),
              {
                timeOut: 60000,
              });
          }
        }
      }
    }
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
