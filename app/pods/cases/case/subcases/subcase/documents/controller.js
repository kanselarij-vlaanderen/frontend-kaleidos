import Controller from '@ember/controller';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask, task } from 'ember-concurrency-decorators';
import {
  all,
  timeout
} from 'ember-concurrency';
import moment from 'moment';
import config from 'fe-redpencil/utils/config';
import {
  addPieceToAgendaitem, restorePiecesFromPreviousAgendaitem
} from 'fe-redpencil/utils/documents';
import {
  destroyApprovalsOfAgendaitem, setNotYetFormallyOk
} from 'fe-redpencil/utils/agendaitem-utils';

export default class DocumentsSubcaseSubcasesController extends Controller {
  @service currentSession;
  @service intl;

  @tracked isEnabledPieceEdit = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked defaultAccessLevel;
  @tracked newPieces = A([]);

  get governmentCanViewDocuments() {
    const isOverheid = this.currentSession.isOverheid;

    const documentsAreReleased = this.subcase.get('requestedForMeeting.releasedDocuments'); // TODO: async ...?
    return !(isOverheid && !documentsAreReleased);
  }

  @action
  async enablePieceEdit() {
    // TODO reload must be moved to save handler
    // when Documents::BatchDocumentEdit component bubbles 'save' action
    await this.ensureFreshData.perform();
    this.isEnabledPieceEdit = true;
  }

  @action
  disablePieceEdit() {
    this.isEnabledPieceEdit = false;
  }

  @action
  async openPieceUploadModal() {
    this.isOpenPieceUploadModal = true;
  }

  @action
  uploadPiece(file) {
    const now = moment().utc()
      .toDate();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
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
    this.send('reloadModel');
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
    yield this.handleSubmittedPieces.perform([piece]);
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
    yield this.case.reload();
    yield this.case.hasMany('pieces').reload();
    yield this.subcase.reload();
    // we don't need to reload subcase.agendaActivities nor subcase.submissionActivities
    // since we query them from the backend on addition of new pieces
  }

  @action
  async setPreviousPiecesFromAgendaitem(documentContainer) {
    if (documentContainer) {
      const lastPiece = await documentContainer.get('lastPiece'); // TODO: what is the purpose of getting lastPiece here
      if (this.subcase && lastPiece) {
        const latestActivity = await this.subcase.get('latestActivity');
        if (latestActivity) {
          const latestAgendaitem = await latestActivity.get('latestAgendaitem');
          await restorePiecesFromPreviousAgendaitem(latestAgendaitem, documentContainer);
          // TODO: make sure we're not loading stale cache
          await latestAgendaitem.hasMany('pieces').reload();
        }
      }
      this.send('reloadModel');
    }
  }

  @task
  *handleSubmittedPieces(pieces) {
    yield this.ensureFreshData.perform();

    // Add the pieces on the case
    const casePieces = yield this.case.pieces;
    casePieces.pushObjects(pieces);
    yield this.case.save();

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
    const agendaActivities = yield this.store.query('agenda-activity', {
      'filter[subcase][:id:]': this.subcase.id,
      'filter[agendaitems][agenda][created-for][is-final]': false,
      'page[size]': 1,
    });

    return agendaActivities.firstObject;
  }

  @task
  *createSubmissionActivity(pieces, agendaActivity = null) {
    let submissionActivity = this.store.createRecord('submission-activity', {
      startDate: new Date(),
      subcase: this.subcase,
      pieces,
      agendaActivity,
    });

    submissionActivity = yield submissionActivity.save();
    return submissionActivity;
  }

  @task
  *updateSubmissionActivity(pieces) {
    const submissionActivities = yield this.store.query('submission-activity', {
      'filter[subcase][:id:]': this.subcase.id,
      'filter[:has-no:agenda-activity]': true,
      'page[size]': 1,
    });

    if (submissionActivities.length) { // Adding pieces to existing submission activity
      let submissionActivity = submissionActivities.firstObject;
      const submissionPieces = yield submissionActivity.pieces;
      submissionPieces.pushObjects(pieces);

      submissionActivity = yield submissionActivity.save();
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
      'filter[agenda-activity][subcase][:id:]': this.subcase.get('id'),
      'filter[agenda][status][:id:]': config.agendaStatusDesignAgenda.id,
    });

    // agendaitems can only have more than 1 item
    // in case the subcase is on multiple (future) open agendas
    for (const agendaitem of agendaitems.toArray()) {
      setNotYetFormallyOk(agendaitem);
      yield destroyApprovalsOfAgendaitem(agendaitem);
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
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
