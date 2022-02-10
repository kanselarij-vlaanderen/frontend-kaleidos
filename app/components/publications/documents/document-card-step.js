import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export default class PublicationsDocumentsDocumentCardStepComponent extends Component {
  @task
  *deletePiece() {
    yield this.args.onDelete();
  }
}
