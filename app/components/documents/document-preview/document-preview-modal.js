import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { canViewDocument } from '../../../utils/can-view-document';

export default class DocumentsDocumentPreviewDocumentPreviewModal extends Component {
  @tracked selectedVersion;
  @tracked selectedFile;

  @tracked sidebarIsOpen = true;

  constructor() {
    super(...arguments);
    this.selectedVersion = this.args.piece;
    [this.selectedFile] = this.selectedVersion.files.filter((file) =>
      canViewDocument(file)
    ) ?? [this.setSelectedVersion.file];
    this.sidebarIsOpen = JSON.parse(
      localStorage.getItem('documentViewerSidebar')
    );
  }

  @action
  setSelectedVersion(piece) {
    this.selectedVersion = piece;
    this.selectedFile = this.selectedVersion.file;
  }

  @action
  setSelectedFile(file) {
    this.selectedFile = file;
  }

  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
    localStorage.setItem(
      'documentViewerSidebar',
      JSON.stringify(this.sidebarIsOpen)
    );
  }
}
