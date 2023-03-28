import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class DocumentsDocumentPreviewDocumentPreviewModal extends Component {
  /**
   * @argument piece
   */

  @tracked sidebarIsOpen = true;
  @tracked selectedVersion;
  @tracked file;

  constructor() {
    super(...arguments);
    this.selectedVersion = this.args.piece;
    this.sidebarIsOpen = JSON.parse(localStorage.getItem('documentViewerSidebar'));
    this.loadFile.perform();
  }

  @action
  toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
    localStorage.setItem('documentViewerSidebar',JSON.stringify(this.sidebarIsOpen));
  }

  @action
  setSelectedVersion(piece) {
    this.selectedVersion = piece;
    this.loadFile.perform();
  }

  @task
  *loadFile() {
    this.file = null;
    const file = yield this.selectedVersion.file;
    const derivedFile = yield file?.derived;
    this.file = derivedFile || file;
  }
}
