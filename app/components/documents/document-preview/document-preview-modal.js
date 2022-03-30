import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DocumentsDocumentPreviewDocumentPreviewModal extends Component {
  @tracked selectedVersion;
  @tracked sidebarIsOpen = true;

  constructor() {
    super(...arguments);
    this.selectedVersion = this.args.piece;

    this.sidebarStorage = JSON.parse(localStorage.getItem('documentViewerSidebar'))

    if (this.sidebarStorage == false) {
      this.sidebarIsOpen = true
    } else {
      this.sidebarIsOpen = true;
    }
  }

  @action
  setSelectedVersion(piece) {
    this.selectedVersion = piece;
  }

  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
    localStorage.setItem('documentViewerSidebar',JSON.stringify(this.sidebarIsOpen));
  }
}
