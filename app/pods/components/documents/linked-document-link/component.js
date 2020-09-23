import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { A } from '@ember/array';

export default class LinkedDocumentLink extends Component {
  @service store;
  @service currentSession;

  @tracked isExpandedVersionHistory = false;
  @tracked isOpenVerifyDeleteModal = false;
  @tracked sortedDocuments = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const containerDocuments = yield this.args.documentContainer.sortedDocuments;
    if (this.args.lastDocument) {
      const idx = containerDocuments.indexOf(this.args.lastDocument);
      this.sortedDocuments = A(containerDocuments.slice(0, idx + 1));
    } else {
      this.sortedDocuments = A(containerDocuments);
    }
  }

  get lastDocument() {
    return this.sortedDocuments.length && this.sortedDocuments.lastObject;
  }

  get reverseSortedDocuments() {
    return this.sortedDocuments.slice(0).reverse();
  }

  @action
  toggleVersionHistory() {
    this.isExpandedVersionHistory = !this.isExpandedVersionHistory;
  }

  @action
  deleteDocumentLink() {
    this.isOpenVerifyDeleteModal = true;
  }

  @action
  cancelDeleteDocumentLink() {
    this.isOpenVerifyDeleteModal = false;
  }

  @action
  verifyDeleteDocumentLink() {
    this.args.onUnlinkDocumentContainer(this.args.documentContainer);
    this.isOpenVerifyDeleteModal = false;
  }
}
