import Component from '@glimmer/component';

export default class DocumentsDocumentPreviewModal extends Component {
  get fileFormatIsSupported() {
    const pdfMime =	'application/pdf';
    const pdfExtension = 'pdf';
    const file = this.args.piece.file;
    return file.get('format').toLowerCase().includes(pdfMime) // eslint-disable-line
      || file.get('extension').toLowerCase() === pdfExtension;
  }
}
