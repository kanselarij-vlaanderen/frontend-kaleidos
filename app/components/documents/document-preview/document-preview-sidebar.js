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
export default class DocumentsDocumentPreviewDocumentPreviewSidebar extends Component {
  @service fileService;
  @service('current-session') currentSessionService;

  @service store;

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

  @action
  changeAccessLevel(accessLevel) {
    this.accessLevel = accessLevel;
  }

  @action
  changeDocumentType(docType) {
    this.documentType = docType;
  }
}
