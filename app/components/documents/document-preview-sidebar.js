import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DocumentsDocumentPreviewSidebar extends Component {
  @tracked documentType;
  @tracked accessLevel;

  @tracked showDetails = true;
  @tracked showSignatures = false;
  @tracked showVersions = false;


  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const docContainer = yield this.args.piece.documentContainer;
    this.documentType = yield docContainer.type;
    this.accessLevel = yield this.args.piece.accessLevel;
  }

  @action
  openDetails() {
    this.resetTabs();
    this.showDetails = true;
  }

  @action
  openSignatures() {
    this.resetTabs();
    this.showSignatures = true;
  }

  @action
  openVersions() {
    this.resetTabs();
    this.showVersions = true;
  }

  resetTabs() {
    this.showDetails = false;
    this.showSignatures = false;
    this.showVersions = false;
  }
}
