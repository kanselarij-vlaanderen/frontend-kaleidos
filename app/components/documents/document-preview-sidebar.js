import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';


/**
 *
 * Contains tabs:
 * - "details"
 * - "signatures"
 * - "versions"
 */
export default class DocumentsDocumentPreviewSidebar extends Component {
  @service fileService;

  @tracked documentType;
  @tracked docContainer;
  @tracked accessLevel;
  @tracked lastPiece;
  @tracked versionPieces;

  @tracked activeTab = 'details';
  @tracked isOpenUploadVersionModal = false;

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


  resetTabs() {
    this.showDetails = false;
    this.showSignatures = false;
    this.showVersions = false;
  }

  @action
  async deleteVersion(versionPiece) {
    await this.fileService.deletePiece(versionPiece);
    // delete orphan container if last piece is deleted
    if (this.versionPieces.size <= 1){
      await this.fileService.deleteDocumentContainer(this.docContainer)
      this.args.transitionBack();
    }
    //if you deleted current file also go back
    if (versionPiece.id === this.args.piece.id){
      this.args.transitionBack();
    }
    this.loadVersionHistory.perform();
  }
}
