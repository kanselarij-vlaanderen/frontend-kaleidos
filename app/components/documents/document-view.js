import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

const PDF_MIME = 'application/pdf';
const PDF_EXTENSION = 'pdf';

export default class DocumentsDocumentView extends Component {
  @service pieceAccessLevelService;

  get isPdfDocument() {
    if (this.args.file) {
      return this.args.file.get('format').toLowerCase().includes(PDF_MIME)
        || this.args.file.get('extension').toLowerCase() == PDF_EXTENSION;
    } else {
      return false;
    }
  }

  canViewConfidentialPiece = async () => {
    return await this.pieceAccessLevelService.canViewConfidentialPiece(this.args.piece);
  }
}
