import Component from '@glimmer/component';

export default class DocumentsDocumentBadge extends Component {
  /**
   * @argument piece:
   * @argument isClickable: boolean indicating wether the document can be viewed by clicking it.
   * @argument isHighlighted: boolean indicating wether to highlight the piece
   */

  get documentIconClass() {
    const parts = [];
    if (this.args.isHighlighted) {
      parts.push('ki-document-added');
    }
    if (this.args.piece.confidential) {
      parts.push('ki-lock-closed');
    }
    if (parts.length) {
      return parts.join(' ');
    }
    return 'ki-document';
  }
}
