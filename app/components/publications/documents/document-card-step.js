import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class PublicationsDocumentsDocumentCardStepComponent extends Component {

  @tracked signMarkingActivity;

  constructor() {
    super(...arguments);
    this.loadSignatureRelatedData.perform();
  }

  @task
  *deletePiece() {
    yield this.args.onDelete();
  }

  @task
  *loadSignatureRelatedData() {
    this.signMarkingActivity = yield this.args.piece.signMarkingActivity;
  }
}
