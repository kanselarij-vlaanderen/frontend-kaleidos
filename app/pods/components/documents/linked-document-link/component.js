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
  @tracked sortedPieces = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const containerPieces = yield this.args.documentContainer.sortedPieces;
    if (this.args.lastPiece) {
      const idx = containerPieces.indexOf(this.args.lastPiece);
      this.sortedPieces = A(containerPieces.slice(0, idx + 1));
    } else {
      this.sortedPieces = A(containerPieces);
    }
  }

  get lastPiece() {
    return this.sortedPieces.length && this.sortedPieces.lastObject;
  }

  get reverseSortedPieces() {
    return this.sortedPieces.slice(0).reverse();
  }

  @action
  toggleVersionHistory() {
    this.isExpandedVersionHistory = !this.isExpandedVersionHistory;
  }

  @action
  deletePieceLink() {
    this.isOpenVerifyDeleteModal = true;
  }

  @action
  cancelDeletePieceLink() {
    this.isOpenVerifyDeleteModal = false;
  }

  @action
  verifyDeletePieceLink() {
    this.args.onUnlinkDocumentContainer(this.args.documentContainer);
    this.isOpenVerifyDeleteModal = false;
  }
}
