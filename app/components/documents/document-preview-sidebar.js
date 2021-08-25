import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isBlank } from '@ember/utils';
import VRDocumentName from '../../utils/vr-document-name';

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
  @tracked docContainer;
  @tracked accessLevel;
  @tracked lastPiece;
  @tracked versionPieces;

  @tracked activeTab = 'details';
  @tracked isOpenUploadVersionModal = false;
  @tracked isVerifyingDelete = false;
  @tracked selectedToDelete;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.docContainer = yield this.args.piece.documentContainer;
    this.loadVersionHistory.perform();
    this.documentType = yield this.docContainer.type;
    this.accessLevel = yield this.args.piece.accessLevel;
  }

  @task
  *loadVersionHistory() {
    this.versionPieces = yield this.docContainer.reverseSortedPieces;
    this.lastPiece = yield this.docContainer.lastPiece;
  }

  @action
  setActiveTab(tabName) {
    this.activeTab = tabName;
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
  async saveUploadVersionModal(newVersion) {
    let accessLevel = await this.lastPiece.accessLevel;
    if (isBlank(accessLevel)){
      accessLevel = await this.store.findRecordByUri('access-level', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);
    }
    const now = moment().utc()
      .toDate();
    let newPiece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      name: newVersion.name,
      file: newVersion.file,
      previousPiece: this.lastPiece,
      confidential: this.lastPiece.confidential,
      accessLevel: accessLevel,
      documentContainer: this.docContainer,
    });
    await newPiece.save();

    this.isOpenUploadVersionModal = false;
    this.loadVersionHistory.perform();
    this.router.transitionTo('document', newPiece.id)
  }

  @action
  async deletePiece() {
    await this.fileService.deletePiece(this.selectedToDelete);
    // delete orphan container if last piece is deleted
    if (this.versionPieces.size <= 1){
      await this.fileService.deleteDocumentContainer(this.docContainer)
      this.args.transitionBack();
    }
    //if you deleted current file also go back
    if (this.selectedToDelete.id === this.args.piece.id){
      this.args.transitionBack();
    }
    this.loadVersionHistory.perform();
    this.selectedToDelete = null;
    this.isVerifyingDelete = false;
  }

  @action
  openVerify(piece) {
    this.selectedToDelete = piece;
    this.isVerifyingDelete = true;
  }

  @action
  cancelVerify() {
    this.selectedToDelete = null;
    this.isVerifyingDelete = false;
  }

  get newVersionName(){
    return new VRDocumentName(this.lastPiece.name).withOtherVersionSuffix(this.versionPieces.length);
  }
}
