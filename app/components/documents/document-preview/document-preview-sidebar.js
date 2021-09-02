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
export default class DocumentsDocumentPreviewDocumentPreviewSidebar extends Component {
  @tracked documentContainer;
  @tracked activeTab = 'details';

  constructor() {
    super(...arguments);
    this.loadPieceData.perform();
  }

  @task
  *loadPieceData() {
    this.documentContainer = yield this.args.piece.documentContainer;
  }

  @action
  setActiveTab(tabName) {
    this.activeTab = tabName;
  }
}
