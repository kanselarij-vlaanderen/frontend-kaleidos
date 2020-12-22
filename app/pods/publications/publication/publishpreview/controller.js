import Controller from '@ember/controller';
import {
  action, set
} from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import CONFIG from 'fe-redpencil/utils/config';
import { A } from '@ember/array';
import moment from 'moment';
import { task } from 'ember-concurrency-decorators';

export default class PublicationPublishPreviewController extends Controller {
  // Services.
  @service activityService;
  @service subcasesService;
  @service fileService;

  // properties for making the design
  @tracked withdrawn = true;
  @tracked showLoader = false;
  @tracked showpublicationModal = false;
  @tracked publicationActivity = {
    previewActivity: {},
    mailContent: '',
    subjectContent: '',
    pieces: A([]),
  };

  // piece uploading
  @tracked isOpenUploadPublishPreviewModal = false;
  @tracked isOpenUploadPublishPreviewCorrectionModal = false;
  @tracked uploadedFile = null;
  @tracked pieceInCreation = null;
  @tracked isSavingPieces = false;
  @tracked isUploadModalResized = false;
  @tracked activityToAddPiecesTo = null;
  @tracked defaultAccessLevel = null;
  @tracked pieceToDelete = null;
  @tracked isVerifyingDelete = false;
  @tracked activityToDeletePiecesFrom = null;

  get publishPreviewActivities() {
    const publishPreviewActivities = this.model.publishPreviewActivities.map((activity) => activity);
    return publishPreviewActivities;
  }

  @action
  toggleUploadModalSize() {
    this.isUploadModalResized = !this.isUploadModalResized;
  }

  @action
  openUploadPublishPreviewModal(activity) {
    this.activityToAddPiecesTo = activity;
    this.isOpenUploadPublishPreviewModal = true;
  }

  @action
  openUploadPublishPreviewCorrectionModal(activity) {
    this.activityToAddPiecesTo = activity;
    this.isOpenUploadPublishPreviewCorrectionModal = true;
  }

  @task
  *uploadPublishPreview(file) {
    if (!this.defaultAccessLevel) {
      this.defaultAccessLevel = yield this.store.findRecord('access-level', CONFIG.internRegeringAccessLevelId);
    }
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
    this.pieceInCreation = piece;
  }

  @task
  *uploadPublishPreviewCorrection(file) {
    const generatedPieces = yield this.activityToAddPiecesTo.get('generatedPieces').toArray();
    let lastVersionOfPublishPreview;
    for (const generatedPiece of generatedPieces) {
      const nextPiece = yield generatedPiece.get('nextVersion');
      if (!nextPiece) {
        lastVersionOfPublishPreview = generatedPiece;
      }
    }
    if (!this.defaultAccessLevel) {
      this.defaultAccessLevel = yield this.store.findRecord('access-level', CONFIG.internRegeringAccessLevelId);
    }
    const previousAccessLevel = yield lastVersionOfPublishPreview.accessLevel;
    const documentContainer = yield lastVersionOfPublishPreview.documentContainer;
    const containerPieces = yield documentContainer.hasMany('pieces').reload();
    const now = moment().utc()
      .toDate();
    const correctionPiece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      previousPiece: lastVersionOfPublishPreview,
      accessLevel: previousAccessLevel || this.defaultAccessLevel,
      confidential: lastVersionOfPublishPreview.confidential,
      name: file.filenameWithoutExtension,
      documentContainer,
    });
    containerPieces.pushObject(correctionPiece);
    this.pieceInCreation = correctionPiece;
  }

  @task
  *savePublishPreviewOrCorrection() {
    this.showLoader = true;
    this.isOpenUploadPublishPreviewModal = false;
    this.isOpenUploadPublishPreviewCorrectionModal = false;
    try {
      const documentContainer = yield this.pieceInCreation.documentContainer;
      // TODO set document type publish preview
      yield documentContainer.save();
      yield this.savePiece.perform(this.pieceInCreation);
      const pieces = yield this.activityToAddPiecesTo.hasMany('generatedPieces').reload();
      pieces.pushObject(this.pieceInCreation);
      yield this.activityToAddPiecesTo.save();
    } catch (error) {
      yield this.deleteUploadedPiece.perform(this.pieceInCreation);
      throw error;
    }

    this.pieceInCreation = null;
    this.activityToAddPiecesTo = null;
    this.showLoader = false;
  }

  /**
   * Save a new document container and the piece it wraps
   */
  @task
  *savePiece(piece) {
    yield piece.save();
    // TODO do we want to save this to case pieces ? assuming yes
    const pieces = yield this.model.case.hasMany('pieces').reload();
    pieces.pushObject(piece);
    yield this.model.case.save();
  }

  @task
  *cancelUploadPublishPreview() {
    if (this.pieceInCreation) {
      yield this.deleteUploadedPiece.perform(this.pieceInCreation);
    }
    // TODO reset container needed ?
    this.pieceInCreation = null;
    this.activityToAddPiecesTo = null;
    this.isOpenUploadPublishPreviewModal = false;
  }

  @task
  *cancelUploadPublishPreviewCorrection() {
    if (this.pieceInCreation) {
      yield this.deleteUploadedPiece.perform(this.pieceInCreation);
    }
    // TODO reset container needed ?
    this.pieceInCreation = null;
    this.activityToAddPiecesTo = null;
    this.isOpenUploadPublishPreviewCorrectionModal = false;
  }

  @task
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    this.pieceInCreation = null;
    const documentContainer = yield piece.documentContainer;
    const containerPieces = yield documentContainer.pieces;
    if (containerPieces < 2) {
      yield documentContainer.destroyRecord();
    }
    yield piece.destroyRecord();
  }

  @action
  cancelDeleteExistingPiece() {
    this.pieceToDelete = null;
    this.activityToDeletePiecesFrom = null;
    this.isVerifyingDelete = false;
  }

  @action
  deleteExistingPiece(piece, activity) {
    this.pieceToDelete = piece;
    this.activityToDeletePiecesFrom = activity;
    this.isVerifyingDelete = true;
  }

  @task
  *verifyDeleteExistingPiece() {
    // TODO delete with undo ?
    this.showLoader = true;
    this.isVerifyingDelete = false;
    const documentContainer = yield this.pieceToDelete.get('documentContainer');
    const piecesFromContainer = yield documentContainer.get('pieces');
    if (piecesFromContainer.length < 2) {
      // Cleanup documentContainer if we are deleting the last piece in the container
      // Must revise if we link docx and pdf as multiple files in 1 piece
      yield this.fileService.deleteDocumentContainer(documentContainer);
    } else {
      yield this.fileService.deletePiece(this.pieceToDelete);
    }
    yield this.activityToDeletePiecesFrom.hasMany('generatedPieces').reload();
    this.showLoader = false;
    this.pieceToDelete = null;
    this.activityToDeletePiecesFrom = null;
    // TODO refresh the activity, action delete not available but should be on new last version
  }

  /** BS PUBLICATION ACTIVITIES **/

  @action
  async requestPublicationModal(activity) {
    this.publicationActivity.pieces = await activity.usedPieces;
    set(this.publicationActivity, 'previewActivity', activity);
    this.publicationActivity.mailContent = this.activityService.replaceTokens(CONFIG.mail.publishRequest.content, this.model.publicationFlow, this.model.case);
    this.publicationActivity.mailSubject = this.activityService.replaceTokens(CONFIG.mail.publishRequest.subject, this.model.publicationFlow, this.model.case);
    this.showpublicationModal = true;
  }

  @action
  async cancelPublicationModal() {
    set(this.publicationActivity, 'previewActivity', {});
    set(this.publicationActivity, 'pieces', A([]));
    set(this.publicationActivity, 'mailContent', '');
    set(this.publicationActivity, 'mailSubject', '');
    this.showpublicationModal = false;
  }

  @action
  async createPublicationActivity() {
    this.showpublicationModal = false;
    this.showLoader = true;

    // Fetch the type.
    const publishSubCaseType = await this.store.findRecord('subcase-type', CONFIG.SUBCASE_TYPES.publicatieBS.id);

    // TODO take from other subcase maybe?
    const shortTitle = await this.model.case.shortTitle;
    const title = await this.model.case.title;

    // Find or create Subcase.
    const subcase = await this.subcasesService.findOrCreateSubcaseFromTypeInPublicationFlow(publishSubCaseType, this.model.publicationFlow, title, shortTitle);

    // Create activity in subcase.
    await this.activityService.createNewPublishActivity(this.publicationActivity.mailContent, this.publicationActivity.pieces, subcase, this.publicationActivity.previewActivity);

    // Visual stuff.
    this.selectedPieces = A([]);

    // Reset local activity to empty state.
    this.publicationActivity = {
      previewActivity: {},
      mailContent: '',
      mailSubject: '',
      pieces: A([]),
    };
    this.showLoader = false;
    await this.send('refreshModel');
    // TODO Add email hook here.
    alert('the mails dont work yet. infra is working on it.');
  }

  @action
  async cancelExistingPreviewActivity(previewActivity) {
    this.showLoader = true;
    const withDrawnStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.withdrawn.id);
    previewActivity.status = withDrawnStatus;
    previewActivity.endDate = moment().utc();
    await previewActivity.save();
    this.model.refreshAction();
    this.showLoader = false;
  }

  @action
  async markPreviewActivityDone(previewActivity) {
    this.showLoader = true;
    const closedStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.closed.id);
    previewActivity.status = closedStatus;
    previewActivity.endDate = moment().utc();
    await previewActivity.save();
    this.model.refreshAction();
    this.showLoader = false;
  }

  @action
  async cancelExistingPublicationActivity(previewActivity) {
    this.showLoader = true;
    const withDrawnStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.withdrawn.id);
    await previewActivity.get('publishedBy').
      filter((publishingActivity) => publishingActivity.get('status') === CONFIG.ACTIVITY_STATUSSES.open).
      map(async(publishingActivity) => {
        publishingActivity.status = withDrawnStatus;
        publishingActivity.endDate = moment().utc();
        await publishingActivity.save();
        this.model.refreshAction();
      });
    this.showLoader = false;
  }

  @action
  async markPublicationActivityPublished(previewActivity) {
    this.showLoader = true;
    const closedStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.closed.id);
    await previewActivity.get('publishedBy').
      filter((publishingActivity) => publishingActivity.get('status') === CONFIG.ACTIVITY_STATUSSES.open).
      map(async(publishingActivity) => {
        publishingActivity.status = closedStatus;
        publishingActivity.endDate = moment().utc();
        await publishingActivity.save();
        this.model.refreshAction();
      });
    this.showLoader = false;
  }

  @action
  editPublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  editCorrection() {
    alert('this action is implemented in another ticket');
  }

  @action
  async showPieceViewer(piece) {
    window.open(`/document/${(await piece).get('id')}`);
  }
}
