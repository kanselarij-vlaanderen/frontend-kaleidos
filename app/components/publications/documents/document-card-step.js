import Component from '@glimmer/component';
import { service } from '@ember/service';
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

  deletePiece = task(async () => {
    await this.args.onDelete();
  });

  loadSignatureRelatedData = task(async () => {
    this.signMarkingActivity = await this.args.piece.belongsTo('signMarkingActivity').reload();
  });
}
