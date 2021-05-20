import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class PublicationsBatchDocumentsPublicationModalComponent extends Component {
  get pieces() {
    return this.args.pieces;
  }

  @action
  onCancel() {
    this.args.onCancel();
  }
}
