import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 *
 * Contains tabs:
 * - "details"
 * - "signatures"
 * - "versions"
 */
export default class DocumentsDocumentPreviewSidebar extends Component {
  @tracked documentType;
  @tracked docContainer;
  @tracked accessLevel;
  @tracked lastPiece;

  @tracked activeTab = 'details';

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
  setActiveTab(tabName) {
    this.activeTab = tabName;
  }
}
