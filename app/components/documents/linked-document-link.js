import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { task } from 'ember-concurrency';

export default class LinkedDocumentLink extends Component {
  @service pieceAccessLevelService;

  @tracked isOpenVerifyDeleteModal = false;

  @tracked sortedPieces = [];
  @tracked accessLevel;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const containerPieces = yield this.args.documentContainer.pieces;
    const sortedContainerPieces = containerPieces
      .slice()
      .sort((p1, p2) => p1.created - p2.created);
    if (this.args.lastPiece) {
      const idx = sortedContainerPieces.indexOf(this.args.lastPiece);
      this.sortedPieces = A(sortedContainerPieces.slice(0, idx + 1));
    } else {
      this.sortedPieces = A(sortedContainerPieces);
    }
    this.accessLevel = yield this.lastPiece.accessLevel;
  }

  get lastPiece() {
    return this.sortedPieces.length && this.sortedPieces.at(-1);
  }

  get reverseSortedPieceHistory() {
    return this.sortedPieces.reverse().slice(1);
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
