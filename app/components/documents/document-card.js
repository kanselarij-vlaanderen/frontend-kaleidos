import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';
import moment from 'moment';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { task } from 'ember-concurrency';
import { isPresent, isEmpty } from '@ember/utils';
import ENV from 'frontend-kaleidos/config/environment';

export default class DocumentsDocumentCardComponent extends Component {
  /**
   * A document card with expandable document history .
   * By default uses the @piece argument, but can fall back to @documentContainer when
   * no piece is provided. In this case the latest version within the container will be shown.
   *
   * @argument piece: a Piece object
   * @argument documentContainer: a DocumentContainer object
   * @argument didDeletePiece: action triggered when a piece has been deleted
   * @argument didDeleteContainer: action triggered when a container has been deleted
   * @argument onOpenUploadModal: action triggered before the modal to upload a new version opens
   * @argument onAddPiece: action triggered when a new version has been added
   * @argument bordered: determines if the card has a border
   */
  @service store;
  @service currentSession;
  @service fileService;
  @service toaster;
  @service intl;
  @service pieceAccessLevelService;

  @tracked isOpenUploadModal = false;
  @tracked isOpenVerifyDeleteModal = false;
  @tracked isEditingPiece = false;

  @tracked piece;
  @tracked accessLevel;
  @tracked documentContainer;
  @tracked signMarkingActivity;

  @tracked uploadedFile;
  @tracked newPiece;
  @tracked pieceNameBuffer;
  @tracked defaultAccessLevel;
  @tracked pieces = A();

  constructor() {
    super(...arguments);
    this.loadCodelists.perform();
    this.loadPieceRelatedData.perform();
    this.signaturesEnabled = !isEmpty(ENV.APP.ENABLE_SIGNATURES);
  }

  get bordered() {
    return isPresent(this.args.bordered) ? this.args.bordered : true;
  }

  @task
  *loadCodelists() {
    this.defaultAccessLevel = yield this.store.findRecordByUri(
      'concept',
      CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );
  }

  @task
  *loadSignatureRelatedData() {
    if (this.args.hasMarkForSignature) {
      this.signMarkingActivity = yield this.piece.signMarkingActivity;
    }
  }

  @task
  *loadPublicationFlowRelatedData() {
    if (this.currentSession.may('manage-publication-flows')) {
      const publicationFlow = yield this.piece.publicationFlow;
      yield publicationFlow?.identification;
    }
  }

  @task
  *loadPieceRelatedData() {
    const loadPiece = (id) =>
      this.store.queryOne('piece', {
        'filter[:id:]': id,
        include: 'document-container,document-container.type,access-level',
      });

    if (this.args.piece) {
      this.piece = this.args.piece; // Assign what we already have, so that can be rendered already
      this.piece = yield loadPiece(this.piece.id);
      this.documentContainer = yield this.piece.documentContainer;
      this.accessLevel = yield this.piece.accessLevel;
      yield this.loadVersionHistory.perform();
    } else if (this.args.documentContainer) {
      // This else does not seem used (no <Documents::DocumentCard> that passes this arg)
      this.documentContainer = this.args.documentContainer;
      yield this.loadVersionHistory.perform();
      const lastPiece = this.reverseSortedPieces.lastObject;
      this.piece = yield loadPiece(lastPiece.id);
      this.accessLevel = yield this.piece.accessLevel;
    } else {
      throw new Error(
        `You should provide @piece or @documentContainer as an argument to ${this.constructor.name}`
      );
    }
    // When this task is done, we can trigger the other less important tasks
    this.loadPublicationFlowRelatedData.perform();
    this.loadSignatureRelatedData.perform();
  }

  @task
  *loadVersionHistory() {
    this.pieces = yield this.documentContainer.hasMany('pieces').reload();
    for (const piece of this.pieces.toArray()) {
      yield piece.belongsTo('accessLevel').reload();
    }
  }

  get sortedPieces() {
    return A(sortPieces(this.pieces.toArray()).reverse());
  }

  get reverseSortedPieces() {
    return this.sortedPieces.slice(0).reverse(); // slice(0) as a hack to create a new array, since "reverse" happens in-place
  }

  get visiblePieces() {
    const idx = this.reverseSortedPieces.indexOf(this.piece) + 1;
    return A(this.reverseSortedPieces.slice(idx));
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
    const now = moment().utc().toDate();
    this.newPiece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      previousPiece: previousPiece,
      accessLevel: previousAccessLevel || this.defaultAccessLevel,
      documentContainer: this.documentContainer,
    });
    this.newPiece.name = new VRDocumentName(
      previousPiece.name
    ).withOtherVersionSuffix(this.sortedPieces.length + 1);
  }

  @task
  *addPiece() {
    try {
      yield this.args.onAddPiece(this.newPiece);
      this.pieceAccessLevelService.updatePreviousAccessLevel(this.newPiece);
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
    this.pieceNameBuffer = this.piece.name;
    this.isEditingPiece = true;
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
  *markOrUnmarkForSignature() {
    if (!this.signMarkingActivity) {
      yield this.args.markForSignature(this.args.piece);
    } else {
      yield this.args.unmarkForSignature(this.args.piece);
    }
    yield this.loadSignatureRelatedData.perform();
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
    yield this.fileService.deleteDocumentContainerWithUndo.perform(
      this.documentContainer
    );
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
    await this.pieceAccessLevelService.updatePreviousAccessLevels(this.piece);
    await this.loadPieceRelatedData.perform();
  }

  @action
  changeAccessLevelOfPiece(piece, accessLevel) {
    piece.set('accessLevel', accessLevel);
  }

  @action
  async saveAccessLevelOfPiece(piece) {
    await piece.save();
    await this.pieceAccessLevelService.updatePreviousAccessLevels(piece);
  }

  @action
  async reloadAccessLevel() {
    await this.loadPieceRelatedData.perform();
  }
}
