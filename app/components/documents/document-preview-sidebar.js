import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DocumentsDocumentPreviewSidebar extends Component {
  @tracked documentType;
  @tracked docContainer;
  @tracked accessLevel;
  @tracked lastPiece;

  @tracked showDetails = true;
  @tracked showSignatures = false;
  @tracked showVersions = false;


  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.docContainer = yield this.args.piece.documentContainer;
    yield this.docContainer.reverseSortedPieces;
    this.lastPiece = yield this.docContainer.lastPiece;
    this.documentType = yield this.docContainer.type;
    this.accessLevel = yield this.args.piece.accessLevel;
  }

  @action
  openDetails() {
    this.resetTabs();
    this.showDetails = true;
  }

  @action
  openSignatures() {
    this.resetTabs();
    this.showSignatures = true;
  }

  @action
  openVersions() {
    this.resetTabs();
    this.showVersions = true;
  }

  resetTabs() {
    this.showDetails = false;
    this.showSignatures = false;
    this.showVersions = false;
  }
}
