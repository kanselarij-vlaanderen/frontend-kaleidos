import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isBlank } from '@ember/utils';
import VRDocumentName from '../../../utils/vr-document-name';
import { A } from '@ember/array';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

/**
 *
 * Contains tabs:
 * - "details"
 * - "signatures"
 * - "versions"
 */
export default class DocumentsDocumentPreviewDocumentPreviewSidebar extends Component {
  @service fileService;
  @service('current-session') currentSessionService;

  @service router;
  @service store;

  @tracked documentType;
  @tracked documentContainer;
  @tracked accessLevel;
  @tracked lastPiece;
  @tracked versions;

  @tracked activeTab = 'details';
  @tracked isOpenUploadVersionModal = false;
  @tracked isDeletingPiece = false;
  @tracked selectedToDelete;

  @tracked isEditingDetails = false;
  @tracked editPieceMemory;

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
  *loadVersionsData() {
    const pieces = yield this.documentContainer.hasMany('pieces').reload();
    const sortedPieces = A(sortPieces(pieces.toArray()).reverse());
    this.versions = sortedPieces.slice(0).reverse();
    this.lastPiece = sortedPieces.lastObject;
  }

  @action
  setActiveTab(tabName) {
    this.activeTab = tabName;
    if (tabName === 'details') {
      this.loadDetailsData.perform();
    }
    if (tabName === 'versions') {
      this.loadVersionsData.perform();
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
    this.args.openNewPiece(newPiece);
    await this.loadVersionsData.perform();
  }

  @action
  async deletePiece() {
    await this.fileService.deletePiece(this.selectedToDelete);
    // delete orphan container if last piece is deleted
    if (this.versions.size <= 1) {
      await this.fileService.deleteDocumentContainer(this.documentContainer);
      this.args.transitionBack();
    }
    //if you deleted current file also go back
    if (this.selectedToDelete.id === this.args.piece.id) {
      this.args.transitionBack();
    }
    await this.loadVersionsData.perform();
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
      this.versions.length
    );
  }

  @action
  async cancelEditDetails() {
    this.args.resetPiece(this.editPieceMemory);
    await this.loadData.perform();
    this.editPieceMemory = null;
    this.isEditingDetails = false;
  }

  @task
  *saveEditDetails() {
    yield this.args.piece.save();
    this.documentContainer.type = this.documentType;
    yield this.documentContainer.save();

    yield this.loadData.perform();
    this.editPieceMemory = null;
    this.isEditingDetails = false;
  }

  @action
  openEditDetails() {
    this.isEditingDetails = true;
    this.editPieceMemory = {
      name: this.args.piece.name,
      docType: this.documentType,
      accessLevel: this.accessLevel,
      confidentiality: this.args.piece.confidential,
    };
  }

  @action
  changeAccessLevel(accessLevel) {
    this.accessLevel = accessLevel;
  }

  @action
  changeDocumentType(docType) {
    this.documentType = docType;
  }
}
