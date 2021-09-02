import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DocumentsDocumentPreviewDocumentPreviewModal extends Component {
  @tracked selectedVersion;

  constructor() {
    super(...arguments);
    this.selectedVersion = this.args.piece;
  }

  get fileFormatIsSupported() {
    const pdfMime = 'application/pdf';
    const pdfExtension = 'pdf';
    const file = this.selectedVersion.file;
    return (
      file.get('format').toLowerCase().includes(pdfMime) || // eslint-disable-line
      file.get('extension').toLowerCase() === pdfExtension
    );
  }

  @action
  setSelectedVersion(piece) {
    this.selectedVersion = piece;
  }
}
