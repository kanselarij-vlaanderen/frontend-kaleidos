import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isBlank } from '@ember/utils';
import VRDocumentName from '../../../utils/vr-document-name';

/**
 *
 * Contains tabs:
 * - "details"
 * - "signatures"
 * - "versions"
 */
export default class DocumentsDocumentPreviewSidebar extends Component {
  @service fileService;
  @service router;
  @service store;

  @tracked documentType;
  @tracked documentContainer;
  @tracked accessLevel;
  @tracked lastPiece;
  @tracked versionPieces;

  @tracked activeTab = 'details';
  @tracked isOpenUploadVersionModal = false;
  @tracked isDeletingPiece = false;
  @tracked selectedToDelete;

  constructor() {
    super(...arguments);
    this.loadDetailsData.perform();
  }

  @task
  *loadDetailsData() {
    this.documentContainer = yield this.args.piece.documentContainer;
    this.documentType = yield this.documentContainer.type;
    this.accessLevel = yield this.args.piece.accessLevel;
  }

  @task
  *loadVersionHistory() {
    this.versionPieces = yield this.documentContainer.reverseSortedPieces;
    this.lastPiece = yield this.documentContainer.lastPiece;
  }

  @action
  setActiveTab(tabName) {
    this.activeTab = tabName;
    if (tabName === 'details'){
      this.loadDetailsData.perform();
    }
    if (tabName === 'versions'){
      this.loadVersionHistory.perform();
    }
  }

  @action
  openUploadVersionModal() {
    this.isOpenUploadVersionModal = true;
  }

  @action
  closeUploadVersionModal() {
    this.isOpenUploadVersionModal = false;
  }

  @action
  async saveUploadVersionModal(piece) {
    let accessLevel = await this.lastPiece.accessLevel;
    if (isBlank(accessLevel)) {
      accessLevel = await this.store.findRecordByUri(
        'access-level',
        CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
      );
    }
    const now = new Date();
    let newPiece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      name: piece.name,
      file: piece.file,
      previousPiece: this.lastPiece,
      confidential: this.lastPiece.confidential,
      accessLevel: accessLevel,
      documentContainer: this.documentContainer,
    });
    await newPiece.save();

    this.isOpenUploadVersionModal = false;
    this.loadVersionHistory.perform();
    this.router.transitionTo('document', newPiece.id);
  }

  @action
  async deletePiece() {
    await this.fileService.deletePiece(this.selectedToDelete);
    // delete orphan container if last piece is deleted
    if (this.versionPieces.size <= 1) {
      await this.fileService.deleteDocumentContainer(this.documentContainer);
      this.args.transitionBack();
    }
    //if you deleted current file also go back
    if (this.selectedToDelete.id === this.args.piece.id) {
      this.args.transitionBack();
    }
    this.loadVersionHistory.perform();
    this.selectedToDelete = null;
    this.isDeletingPiece = false;
  }

  @action
  openDeletePiece(piece) {
    this.selectedToDelete = piece;
    this.isDeletingPiece = true;
  }

  @action
  cancelDeletePiece() {
    this.selectedToDelete = null;
    this.isDeletingPiece = false;
  }

  get newVersionName() {
    return new VRDocumentName(this.lastPiece.name).withOtherVersionSuffix(
      this.versionPieces.length
    );
  }
}
