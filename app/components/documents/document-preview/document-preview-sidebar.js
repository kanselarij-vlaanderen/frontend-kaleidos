import Component from '@glimmer/component';
import ENV from 'frontend-kaleidos/config/environment';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
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
    const isEnabled = !isEmpty(ENV.APP.ENABLE_SIGNATURES);
    const hasPermission = this.currentSession.may('manage-signatures');
    return isEnabled && hasPermission;
  }

  @task
  *loadPieceData() {
    this.documentContainer = yield this.args.piece.documentContainer;
  }

  @action
  etTab(tabName) {
    this.tab = tabName;
    this.args.onTabChanged(tabName);
  }
}
