import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DocumentsDocumentPreviewDocumentPreviewModal extends Component {
  /**
   * @argument piece
   */

  @tracked sidebarIsOpen = true;
  @tracked selectedVersion;

  constructor() {
    super(...arguments);
    this.selectedVersion = this.args.piece;
    this.sidebarIsOpen = JSON.parse(localStorage.getItem('documentViewerSidebar'))
  }

  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
    localStorage.setItem('documentViewerSidebar',JSON.stringify(this.sidebarIsOpen));
  }

  @action
  setSelectedVersion(piece) {
    this.selectedVersion = piece;
  }
}
