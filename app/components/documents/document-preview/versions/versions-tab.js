import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class DocumentsDocumentPreviewVersionsVersionsTabComponent extends Component {
  @action
  openDeletePiece(piece) {
    this.args.openDeletePiece(piece);
  }
}
