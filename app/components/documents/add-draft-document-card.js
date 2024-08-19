import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import { sortPieceVersions } from 'frontend-kaleidos/utils/documents';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class DocumentsAddDraftDocumentCardComponent extends Component {
  /**
   * A document card with expandable document history .
   * By default uses the @piece argument, but can fall back to @documentContainer when
   * no piece is provided. In this case the latest version within the container will be shown.
   *
   * @argument piece: a Piece object
   * @argument documentContainer: a DocumentContainer object
   * @argument onAddPiece: action triggered when a new version has been added
   * @argument bordered: determines if the card has a border
   * @argument label: used to determine what label should be used with the date
   *
   * @argument [agendaitem]: if an agendaitem is linked to the current piece
   */
  @service store;
  @service toaster;
  @service intl;

  @tracked piece;
  @tracked documentContainer;

  @tracked isOpenUploadModal = false;
  @tracked isOpenVerifyDeleteModal = false;
  @tracked uploadedFile;
  @tracked newPiece;
  @tracked pieces = new TrackedArray([]);

  @tracked dateToShowAltLabel;
  @tracked altDateToShow;

  constructor() {
    super(...arguments);
    this.loadPieceRelatedData.perform();
    this.loadFiles.perform();
  }

  get dateToShowLabel() {
    if (isPresent(this.args.dateToShowLabel)) {
      return this.intl.t(this.args.dateToShowLabel);
    }
    if (isPresent(this.dateToShowAltLabel)) {
      return this.dateToShowAltLabel;
    }
    return this.intl.t('created-on');
  }

  get dateToShow() {
    if (isPresent(this.altDateToShow)) {
      return this.altDateToShow;
    }
    return this.args.piece.file?.get('created') || this.args.piece.created;
  }

  get bordered() {
    return isPresent(this.args.bordered) ? this.args.bordered : true;
  }

  @task
  *loadPieceRelatedData() {
    const loadPiece = (id) =>
      this.store.queryOne(this.piece.constructor.modelName, {
        'filter[:id:]': id,
        include: 'document-container.type',
      });
    if (this.args.piece) {
      this.piece = this.args.piece; // Assign what we already have, so that can be rendered already
      this.piece = yield loadPiece(this.piece.id);
      this.documentContainer = yield this.piece.documentContainer;
      yield this.loadVersionHistory.perform();
      // check for alternative label
      if (!isPresent(this.args.dateToShowLabel)) {
        yield this.piece.file;
        const fileCreated = this.piece.file?.get('created');
        const hasPieceBeenEdited =
          this.piece.created?.getTime() !== this.piece.modified?.getTime();
        // file is always create first, if file.created is larger it has been edited
        const hasFileBeenReplaced =
          this.piece.created?.getTime() < fileCreated?.getTime();
        if (hasPieceBeenEdited || hasFileBeenReplaced) {
          this.dateToShowAltLabel = this.intl.t('edited-on');
          // get the most recent date
          this.altDateToShow =
            this.piece.modified?.getTime() > fileCreated?.getTime()
              ? this.piece.modified
              : fileCreated;
        } else {
          this.dateToShowAltLabel = this.intl.t('created-on');
          // fallback to default DateToShow
          // also if created, modifed and file.created are undefined in legacy
        }
      }
    } else if (this.args.documentContainer) {
      // This else does not seem used (no <Documents::DocumentCard> that passes this arg)
      this.documentContainer = this.args.documentContainer;
      yield this.loadVersionHistory.perform();
      const lastPiece = this.reverseSortedPieces.at(-1);
      this.piece = yield loadPiece(lastPiece.id);
    } else {
      throw new Error(
        `You should provide @piece or @documentContainer as an argument to ${this.constructor.modelName}`
      );
    }
  }

  @task
  *loadFiles() {
    const sourceFile = yield this.args.piece.file;
    yield sourceFile?.derived;
  }

  @task
  *loadVersionHistory() {
    if (this.piece.constructor.modelName === 'piece') {
      const piecesFromModel = yield this.documentContainer
        .hasMany('pieces')
        .reload();
      this.pieces = piecesFromModel.slice();
    } else {
      const previousPiece = yield this.piece.previousPiece;
      if (previousPiece) {
        const documentContainer = yield previousPiece.documentContainer;
        const piecesFromModel = yield documentContainer
          .hasMany('pieces')
          .reload();
        this.pieces = [this.piece, ...piecesFromModel.slice()];
      }
    }
    for (const piece of this.pieces) {
      yield piece.belongsTo('accessLevel').reload();
    }
  }

  get mayShowAddNewVersion() {
    return this.piece.constructor.modelName === 'piece';
  }

  get mayShowDeleteDraftPiece() {
    return this.piece.constructor.modelName === 'draft-piece';
  }

  get sortedPieces() {
    return sortPieceVersions(this.pieces.slice()).reverse();
  }

  get reverseSortedPieces() {
    return this.sortedPieces.slice().reverse(); // slice() as a hack to create a new array, since "reverse" happens in-place
  }

  get visiblePieces() {
    const idx = this.reverseSortedPieces.indexOf(this.piece) + 1;
    return this.reverseSortedPieces.slice(idx);
  }

  @task
  *addPiece() {
    try {
      this.newPiece.name = this.newPiece.name.trim();
      yield this.args.onAddPiece(this.piece, this.newPiece);
      this.loadVersionHistory.perform();
      this.newPiece = null;
      this.isOpenUploadModal = false;
    } catch (error) {
      yield this.deleteUploadedPiece.perform();
      this.isOpenUploadModal = false;
      throw error;
    }
  }

  @task
  *uploadPiece(file) {
    yield this.loadVersionHistory.perform();
    const previousPiece = this.sortedPieces.at(-1);
    const now = new Date();
    const newName = new VRDocumentName(
      previousPiece.name
    ).withOtherVersionSuffix(this.sortedPieces.length + 1);
    const type = yield this.documentContainer.type;
    const documentContainer = this.store.createRecord('draft-document-container', {
      created: this.documentContainer.created,
      position: this.documentContainer.position,
      type,
    });
    const accessLevel = yield previousPiece.accessLevel;
    this.newPiece = this.store.createRecord('draft-piece', {
      name: newName,
      created: now,
      modified: now,
      file: file,
      previousPiece: previousPiece,
      documentContainer: documentContainer,
      accessLevel,
    });
  }

  @task
  *deleteUploadedPiece() {
    if (this.newPiece) {
      removeObject(this.pieces, this.newPiece);
      yield deletePiece(this.newPiece);
      this.newPiece = null;
    }
  }

  @task
  *cancelUploadPiece() {
    yield this.deleteUploadedPiece.perform();
    this.isOpenUploadModal = false;
  }

  @task
  *deleteDraftPiece() {
    if (this.piece) {
      const previousPiece = yield this.piece.previousPiece;
      removeObject(this.pieces, this.piece);
      yield deletePiece(this.piece);
      if (isPresent(this.args.onDeletePiece)) {
        yield this.args.onDeletePiece(this.piece, previousPiece);
        yield this.loadPieceRelatedData.perform();
        this.loadFiles.perform();
      }
    }
  }

  @action
  async verifyDeleteDraftPiece() {
    await this.deleteDraftPiece.perform();
    this.isOpenVerifyDeleteModal = false;
  }

  @action
  cancelDeleteDraftPiece() {
    this.isOpenVerifyDeleteModal = false;
  }
}
