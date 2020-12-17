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

  // properties for making the design
  @tracked withdrawn = true;
  @tracked panelCollapsed = false;
  @tracked showLoader = false;
  @tracked showpublicationModal = false;
  @tracked panelIcon = 'chevron-down';
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

  @action
  uploadPublishPreview(file) {
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

  @action
  uploadPublishPreviewCorrection(file) {
    const now = moment().utc()
      .toDate();
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: false,
      name: file.filenameWithoutExtension,
    });
    this.pieceInCreation = piece;
  }

  @task
  *savePublishPreview() {
    this.showLoader = true;
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

  @task
  *savePublishPreviewCorrection() {
    this.showLoader = true;
    this.isOpenUploadPublishPreviewModal = false;
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
  *cancelUploadPieces() {
    if (this.pieceInCreation) {
      yield this.deleteUploadedPiece.perform(this.pieceInCreation);
    }
    this.pieceInCreation = null;
    this.activityToAddPiecesTo = null;
    this.isOpenUploadPublishPreviewModal = false;
  }

  @task
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    this.pieceInCreation = null;
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  /** BS PUBLICATION ACTIVITIES **/

  async requestPublicationModal(activity) {
    this.publicationActivity.pieces = await activity.usedPieces;
    const names = this.publicationActivity.pieces.map((piece) => piece.name).join('\n');
    set(this.publicationActivity, 'previewActivity', activity);
    set(this.publicationActivity, 'mailContent', CONFIG.mail.publishRequest.content.replace('%%attachments%%', names));
    set(this.publicationActivity, 'mailSubject', CONFIG.mail.publishRequest.subject.replace('%%nummer%%', this.model.publicationFlow.publicationNumber));
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
  async cancelExistingPublicationActivity(previewActivity) {
    this.showLoader = true;
    await previewActivity.get('publishedBy').
      filter((publishingActivity) => publishingActivity.get('status') === CONFIG.ACTIVITY_STATUSSES.open).
      map(async(publishingActivity) => {
        publishingActivity.status = CONFIG.ACTIVITY_STATUSSES.withdrawn;
        publishingActivity.endDate = moment().utc();
        await publishingActivity.save();
        await this.send('refreshModel');
      });
    this.showLoader = false;
  }

  @action
  async markPublicationActivityPublished(previewActivity) {
    this.showLoader = true;
    await previewActivity.get('publishedBy').
      filter((publishingActivity) => publishingActivity.get('status') === CONFIG.ACTIVITY_STATUSSES.open).
      map(async(publishingActivity) => {
        publishingActivity.status = CONFIG.ACTIVITY_STATUSSES.closed;
        publishingActivity.endDate = moment().utc();
        await publishingActivity.save();
        await this.send('refreshModel');
      });
    this.showLoader = false;
  }

  @action
  addPublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  deletePublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  editPublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  addCorrection() {
    alert('this action is implemented in another ticket');
  }

  @action
  deleteCorrection() {
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
