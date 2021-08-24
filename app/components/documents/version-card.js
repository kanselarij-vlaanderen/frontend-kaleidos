import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class DocumentsVersionCardComponent extends Component {
  @tracked accessLevel;

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
}
