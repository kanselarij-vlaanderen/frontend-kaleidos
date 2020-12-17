import Controller from '@ember/controller';

export default class DocumentViewerController extends Controller {
  get fileFormatIsSupported() {
    const pdfMime =	'application/pdf';
    const pdfExtension = 'pdf';
    const file = this.model.get('file');
    return file.get('format').toLowerCase().includes(pdfMime) // eslint-disable-line
      || file.get('extension').toLowerCase() === pdfExtension;
  }
}
