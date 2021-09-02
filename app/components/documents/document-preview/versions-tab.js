import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class DocumentsDocumentPreviewVersionsTabComponent extends Component {
  @action
  openDeletePiece(piece) {
    this.args.openDeletePiece(piece);
  }

  @action
  openUploadVersionModal() {
    this.args.openUploadVersionModal();
  }

}
