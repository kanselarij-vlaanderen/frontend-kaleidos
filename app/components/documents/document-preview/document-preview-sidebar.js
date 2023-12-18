import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

/**
 *
 * Contains tabs:
 * - "details"
 * - "signatures" (translated to dutch for display)
 * - "versions" (translated to dutch for display)
 */
export default class DocumentsDocumentPreviewDocumentPreviewSidebar extends Component {
  @service currentSession;

  @tracked documentContainer;
  @tracked tab = 'details';

  constructor() {
    super(...arguments);
    this.loadPieceData.perform();
    if (this.args.tab) {
      this.tab = this.args.tab;
    }
  }

  get isShownSignatureTab() {
    const hasPermission = this.currentSession.may('manage-signatures');
    return hasPermission;
  }

  @task
  *loadPieceData() {
    this.documentContainer = yield this.args.piece.documentContainer;
  }

  @action
  setTab(tabName) {
    this.tab = tabName;
    this.args.onTabChanged(tabName);
  }
}
