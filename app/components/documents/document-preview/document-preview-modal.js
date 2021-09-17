import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class DocumentsDocumentPreviewDocumentPreviewModal extends Component {
  @service media;
  @tracked selectedVersion;

  @tracked sidebarIsOpen = this.media.get('isBigScreen');

  constructor() {
    super(...arguments);
    this.selectedVersion = this.args.piece;
  }

  @action
  setSelectedVersion(piece) {
    this.selectedVersion = piece;
  }

  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
  }
}
