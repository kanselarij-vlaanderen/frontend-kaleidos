import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import ENV from 'frontend-kaleidos/config/environment';

export default class PublicationsDocumentsDocumentCardStepComponent extends Component {
  @service currentSession;

  @tracked signMarkingActivity;

  constructor() {
    super(...arguments);
    this.loadSignatureRelatedData.perform();
  }

  get signaturesEnabled() {
    const isEnabled = !isEmpty(ENV.APP.ENABLE_SIGNATURES);
    const hasPermission = this.currentSession.may('manage-signatures');
    return isEnabled && hasPermission && this.signMarkingActivity;
  }

  @task
  *deletePiece() {
    yield this.args.onDelete();
  }

  @task
  *loadSignatureRelatedData() {
    this.signMarkingActivity = yield this.args.piece.belongsTo('signMarkingActivity').reload();
  }
}
