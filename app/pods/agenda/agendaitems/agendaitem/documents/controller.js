import Controller from '@ember/controller';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import {
  all,
  timeout
} from 'ember-concurrency';
import moment from 'moment';
import {
  addPieceToAgendaitem, restorePiecesFromPreviousAgendaitem
} from 'frontend-kaleidos/utils/documents';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class DocumentsAgendaitemsAgendaController extends Controller {
  @service currentSession;
  @service intl;

  @tracked isEnabledPieceEdit = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked defaultAccessLevel;
  @tracked newPieces = A([]);

  get governmentCanViewDocuments() {
    const isOverheid = this.currentSession.isOverheid;

    const documentsAreReleased = this.agendaitem.get('agenda.createdFor.releasedDocuments'); // TODO async ...?
    return !(isOverheid && !documentsAreReleased);
  }

  @action
  async enablePieceEdit() {
    await this.agendaitem.preEditOrSaveCheck();
    this.isEnabledPieceEdit = true;
  }

  @action
  disablePieceEdit() {
    this.isEnabledPieceEdit = false;
  }

  @action
  async openPieceUploadModal() {
    await this.agendaitem.preEditOrSaveCheck();
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

  @action
  async ensureFreshData() {
    await this.agendaitem.preEditOrSaveCheck();
  }

  @action
  async setPreviousPiecesFromAgendaitem(deletedPiece) {
    // TODO: Assess if we need to go over container. `previousVersion` (if existant) might suffice?
    const documentContainer = await deletedPiece.documentContainer;
    if (documentContainer) {
      const lastPiece = await documentContainer.get('lastPiece'); // TODO: what is the purpose of getting lastPiece here
      if (this.agendaitem && lastPiece) {
        await restorePiecesFromPreviousAgendaitem(this.agendaitem, documentContainer);
        // TODO: make sure we're not loading stale cache
      }
      this.send('reloadModel');
    }
  }

  @task
  *updateRelatedAgendaitemsAndSubcase(pieces) {
    // Link pieces to subcase related to the agendaitem
    const agendaActivity = yield this.agendaitem.agendaActivity;
    if (agendaActivity) {
      const subcase = yield agendaActivity.subcase;
      const currentSubcasePieces = yield subcase.hasMany('pieces').reload();
      const subcasePieces = currentSubcasePieces.pushObjects(pieces);
      subcase.set('pieces', subcasePieces);
      yield subcase.save();
    }
    // Link piece to agendaitem
    setNotYetFormallyOk(this.agendaitem);
    yield this.agendaitem.save();
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

  @action
  refresh() {
    this.send('reloadModel');
  }
}
