import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class PublicationsDocumentsDocumentCardStepComponent extends Component {
  @service currentSession;

  @tracked signMarkingActivity;

  constructor() {
    super(...arguments);
    this.loadSignatureRelatedData.perform();
  }

  get signaturesEnabled() {
    const hasPermission = this.currentSession.may('manage-signatures');
    return hasPermission && this.signMarkingActivity;
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
