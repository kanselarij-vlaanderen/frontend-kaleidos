import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const PDF_MIME = 'application/pdf';
const PDF_EXTENSION = 'pdf';

export default class DocumentsDocumentView extends Component {
  @tracked showWarning = false;

  constructor() {
    super(...arguments);
    //this is a workaround to delay the showing of the warning message for incompatible file types
    setTimeout(() => {
      this.showWarning = true
    }, 500)
  }
  get isPdfDocument() {
    if (this.args.file) {
      return this.args.file.get('format').toLowerCase().includes(PDF_MIME)
        || this.args.file.get('extension').toLowerCase() == PDF_EXTENSION;
    } else {
      return false;
    }
  }

}
