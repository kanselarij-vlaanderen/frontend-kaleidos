import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class LinkedDocumentLink extends Component {
  @service pieceAccessLevelService;

  @tracked isOpenVerifyDeleteModal = false;

  @tracked sortedPieces = new TrackedArray([]);
  @tracked accessLevel;
  @tracked derived;

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
      this.sortedPieces = sortedContainerPieces.slice(0, idx + 1);
    } else {
      this.sortedPieces = sortedContainerPieces;
    }
    this.accessLevel = yield this.lastPiece.accessLevel;
    const file = yield this.lastPiece.file;
    this.derived = yield file?.derived;
    const signedPieceCopy = yield this.lastPiece.signedPieceCopy;
    yield signedPieceCopy?.file;
  }

  get lastPiece() {
    return this.sortedPieces.length && this.sortedPieces.at(-1);
  }

  get reverseSortedPieceHistory() {
    return this.sortedPieces.reverse().slice(1);
  }

  canViewConfidentialPiece = async () => {
    return await this.pieceAccessLevelService.canViewConfidentialPiece(this.lastPiece);
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
