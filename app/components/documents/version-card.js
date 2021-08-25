import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DocumentsVersionCardComponent extends Component {
  @service currentSession;
  @tracked accessLevel;

  @tracked isVerifyingDelete;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.accessLevel = yield this.args.piece.accessLevel;
  }

  get isCurrentDocument(){
    return this.args.currentPiece.id === this.args.piece.id
  }

  get isLastPiece(){
    return this.args.lastPiece.id === this.args.piece.id
  }

  @action
  openVerify() {
    this.isVerifyingDelete = true;
  }

  @action
  confirmDelete() {
    this.args.onDeletePiece();
    this.isVerifyingDelete = false;
  }

  @action
  cancelDelete() {
    this.isVerifyingDelete = false;
  }

}
