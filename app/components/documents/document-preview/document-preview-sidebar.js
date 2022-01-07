import Component from '@glimmer/component';
import ENV from 'frontend-kaleidos/config/environment';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

/**
 *
 * Contains tabs:
 * - "details"
 * - "signatures"
 * - "versions"
 */
export default class DocumentsDocumentPreviewDocumentPreviewSidebar extends Component {
  @service currentSession;

  @tracked documentContainer;
  @tracked activeTab = 'details';

  constructor() {
    super(...arguments);
    this.loadPieceData.perform();
  }

  get isShownSignatureTab() {
    const isEnabled = !isEmpty(ENV.APP.ENABLE_SIGNATURES);
    const hasPermission = this.currentSession.may('manage-signatures');
    return isEnabled && hasPermission;
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
