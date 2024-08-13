import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import sanitize from 'sanitize-filename';

export default class DocumentsDocumentPreviewDocumentPreviewModal extends Component {
  /**
   * @argument piece
   */

  @service pieceAccessLevelService;

  @tracked sidebarIsOpen = true;
  @tracked selectedVersion;
  @tracked file;

  constructor() {
    super(...arguments);
    this.selectedVersion = this.args.piece;
    this.sidebarIsOpen = JSON.parse(localStorage.getItem('documentViewerSidebar')) ?? true;
    this.loadFile.perform();
  }

  // piece or file downloadlinks for not suitable for switch between source and derived
  // we want the piece name + the correct file download
  get downloadLink() {
    if (this.file?.extension) {
      const filename = `${this.selectedVersion.name}.${this.file.extension}`;
      const downloadFilename = sanitize(filename, {
        replacement: '_',
      });
      return `${this.file.downloadLink}?name=${encodeURIComponent(
        downloadFilename
      )}`;
    }
    return 'route-not-found';
  }

  get inlineViewLink() {
    // only shown in pdf reader if extension is pdf, but always calculated.
    return `${this.downloadLink}&content-disposition=inline`;
  }

  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
    localStorage.setItem('documentViewerSidebar',JSON.stringify(this.sidebarIsOpen));
  }

  @task
  *loadFile() {
    this.file = null;
    const file = yield this.selectedVersion.file;
    const derivedFile = yield file?.derived;
    this.file = derivedFile || file;
  }

  canViewConfidentialPiece = async () => {
    return await this.pieceAccessLevelService.canViewConfidentialPiece(this.selectedVersion);
  }
}
