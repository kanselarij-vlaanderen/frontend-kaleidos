import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { A } from '@ember/array';
import moment from 'moment';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import config from 'frontend-kaleidos/utils/config';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

export default class DocumentsDocumentCardComponent extends Component {
  /**
   * A document card with expandable document history .
   * By default uses the @piece argument, but can fall back to @documentContainer when
   * no piece is provided. In this case the latest version within the container will be shown.
   *
   * @argument piece: a Piece object
   * @argument documentContainer: a DocumentContainer object
   * @argument hideNewerVersions: boolean indicating if pieces newer than @piece should be hidden in the history
   * @argument didDeletePiece: action triggered when a piece has been deleted
   * @argument didDeleteContainer: action triggered when a container has been deleted
   * @argument onOpenUploadModal: action triggered before the modal to upload a new version opens
   * @argument onAddPiece: action triggered when a new version has been added
   */
  @service store;
  @service currentSession;
  @service fileService;
  @service toaster;
  @service intl;

  @tracked isExpandedVersionHistory = false;
  @tracked isOpenUploadModal = false;
  @tracked isOpenVerifyDeleteModal = false;
  @tracked isEditingPiece = false;

  @tracked piece;
  @tracked accessLevel;
  @tracked documentContainer;

  @tracked uploadedFile;
  @tracked newPiece;
  @tracked pieceNameBuffer;
  @tracked defaultAccessLevel;
  @tracked pieces = A();

  constructor() {
    super(...arguments);
    this.loadCodelists.perform();
    this.loadPieceRelatedData.perform();
  }

  @task
  *loadCodelists() {
    this.defaultAccessLevel = this.store.peekRecord('access-level', config.internRegeringAccessLevelId);
    if (!this.defaultAccessLevel) {
      const accessLevels = yield this.store.query('access-level', {
        page: {
          size: 1,
        },
        'filter[:id:]': config.internRegeringAccessLevelId,
      });
      this.defaultAccessLevel = accessLevels.firstObject;
    }
  }

  @task
  *loadPieceRelatedData() {
    const piece = this.args.piece;
    if (piece) {
      this.piece = this.args.piece; // Assign what we already have, so that can be rendered already
      this.piece = (yield this.store.query('piece', {
        'filter[:id:]': piece.id,
        include: 'document-container,document-container.type,access-level',
      })).firstObject;
      this.documentContainer = yield this.piece.documentContainer;
      this.accessLevel = yield this.piece.accessLevel;
    } else if (this.args.documentContainer) {
      this.documentContainer = this.args.documentContainer;
      yield this.loadVersionHistory.perform();
      this.piece = yield this.store.query('piece', {
        'filter[:id:]': piece.id,
        include: 'document-container,document-container.type,access-level',
      });
      this.accessLevel = yield this.piece.accessLevel;
    } else {
      throw new Error(`You should provide @piece or @documentContainer as an argument to ${this.constructor.name}`);
    }
  }

  @task
  *loadVersionHistory() {
    this.pieces = yield this.documentContainer.hasMany('pieces').reload();
  }

  get sortedPieces() {
    return A(sortPieces(this.pieces.toArray()).reverse());
  }

  get reverseSortedPieces() {
    return this.sortedPieces.slice(0).reverse(); // slice(0) as a hack to create a new array, since "reverse" happens in-place
  }

  get visiblePieces() {
    if (this.args.hideNewerVersions) {
      const idx = this.reverseSortedPieces.indexOf(this.piece);
      return A(this.reverseSortedPieces.slice(idx));
    }
    return this.reverseSortedPieces;
  }

  @action
  async openUploadModal() {
    if (this.args.onOpenUploadModal) {
      await this.args.onOpenUploadModal();
    }
    this.isOpenUploadModal = true;
  }

  @task
  *uploadPiece(file) {
    yield this.loadVersionHistory.perform();
    const previousPiece = this.sortedPieces.lastObject;
    const previousAccessLevel = yield previousPiece.accessLevel;
    const now = moment().utc()
      .toDate();
    this.newPiece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      previousPiece: previousPiece,
      confidential: previousPiece.confidential,
      accessLevel: previousAccessLevel || this.defaultAccessLevel,
      documentContainer: this.documentContainer,
    });
    this.newPiece.name = new VRDocumentName(previousPiece.name).withOtherVersionSuffix(this.sortedPieces.length + 1);
  }

  @task
  *addPiece() {
    try {
      yield this.args.onAddPiece(this.newPiece);
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
  *deleteUploadedPiece() {
    if (this.newPiece) {
      this.pieces.removeObject(this.newPiece);
      yield this.fileService.deletePiece(this.newPiece);
      this.newPiece = null;
    }
  }

  @task
  *cancelUploadPiece() {
    yield this.deleteUploadedPiece.perform();
    this.isOpenUploadModal = false;
  }

  @action
  enableEditPieceName() {
    if (this.currentSession.isEditor) {
      this.pieceNameBuffer = this.piece.name;
      this.isEditingPiece = true;
    }
  }

  @action
  cancelEditPieceName() {
    this.isEditingPiece = false;
    this.pieceNameBuffer = null;
  }

  @task
  *savePieceName() {
    const now = moment().toDate();
    this.piece.set('modified', now);
    this.piece.set('name', this.pieceNameBuffer);
    yield this.piece.save();
    this.isEditingPiece = false;
    this.pieceNameBuffer = null;
  }

  @task
  *expandVersionHistory() {
    yield this.loadVersionHistory.perform();
    this.isExpandedVersionHistory = true;
  }

  @action
  collapseVersionHistory() {
    this.isExpandedVersionHistory = false;
  }

  @action
  deleteDocumentContainer() {
    this.isOpenVerifyDeleteModal = true;
  }

  @action
  cancelDeleteDocumentContainer() {
    this.isOpenVerifyDeleteModal = false;
  }

  @action
  verifyDeleteDocumentContainer() {
    const verificationToast = {
      type: 'revert-action',
      title: this.intl.t('warning-title'),
      message: this.intl.t('document-being-deleted'),
      options: {
        timeOut: 15000,
      },
    };
    verificationToast.options.onUndo = () => {
      this.fileService.reverseDelete(this.documentContainer.id);
      this.toaster.toasts.removeObject(verificationToast);
    };
    this.toaster.displayToast.perform(verificationToast);
    this.deleteDocumentContainerWithUndo.perform();
    this.isOpenVerifyDeleteModal = false;
  }

  @task
  *deleteDocumentContainerWithUndo() {
    // TODO remove yield once consuming component doesn't pass Proxy as @documentContainer
    yield this.fileService.deleteDocumentContainerWithUndo.perform(this.documentContainer);
    if (this.args.didDeleteContainer) {
      this.args.didDeleteContainer(this.documentContainer);
    }
  }

  @action
  changeAccessLevel(al) {
    this.piece.set('accessLevel', al);
    this.accessLevel = al;
  }

  @action
  async saveAccessLevel() {
    // TODO make sure not to overwrite things
    await this.piece.save();
    await this.loadPieceRelatedData.perform();
  }

  @action
  async changeConfidentiality(confidential) {
    this.piece.set('confidential', confidential);
    // TODO make sure not to overwrite things
    await this.piece.save();
  }

  @action
  async reloadAccessLevel() {
    await this.loadPieceRelatedData.perform();
  }
}
