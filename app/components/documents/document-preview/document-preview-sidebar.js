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
  @tracked documentType;
  @tracked documentContainer;
  @tracked accessLevel;

  @tracked activeTab = 'details';

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

  @action
  setActiveTab(tabName) {
    this.activeTab = tabName;
    if (tabName === 'details') {
      this.loadDetailsData.perform();
    }
  }
}
