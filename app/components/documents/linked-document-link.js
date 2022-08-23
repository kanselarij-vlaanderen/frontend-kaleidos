import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { task } from 'ember-concurrency';

export default class LinkedDocumentLink extends Component {
  @service store;
  @service currentSession;
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
    const containerPieces = yield this.args.documentContainer.sortedPieces;
    if (this.args.lastPiece) {
      const idx = containerPieces.indexOf(this.args.lastPiece);
      this.sortedPieces = A(containerPieces.slice(0, idx + 1));
    } else {
      this.sortedPieces = A(containerPieces);
    }
    this.accessLevel = yield this.lastPiece.accessLevel;
  }

  get lastPiece() {
    return this.sortedPieces.length && this.sortedPieces.lastObject;
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

  @action
  changeAccessLevel(al) {
    this.accessLevel = this.lastPiece.set('accessLevel', al);
  }

  @action
  async saveAccessLevel() {
    await this.lastPiece.save();
    await this.pieceAccessLevelService.updatePreviousAccessLevels(this.piece);
    this.loadData.perform();
  }

  @action
  async reloadAccessLevel() {
    this.accessLevel = await this.lastPiece.belongsTo('accessLevel').reload();
  }

  @action
  showPieceViewer(piece) {
    window.open(`/document/${piece.id}`);
  }
}
