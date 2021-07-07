import Component from '@glimmer/component';

export default class DocumentsDocumentBadge extends Component {
  /**
   * @argument piece:
   * @argument isClickable: boolean indicating wether the document can be viewed by clicking it.
   * @argument isHighlighted: boolean indicating wether to highlight the piece
   */

  get documentIconName() {
    if (this.args.isHighlighted) {
      return 'document-added';
    }
    if (this.args.piece.confidential) {
      return 'lock-closed';
    }
    return 'document';
  }
}
