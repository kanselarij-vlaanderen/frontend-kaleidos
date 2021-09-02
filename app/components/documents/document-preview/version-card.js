import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class DocumentsDocumentPreviewVersionCardComponent extends Component {
  @service currentSession;
  @tracked accessLevel;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.accessLevel = yield this.args.piece.accessLevel;
  }

  get isCurrentPiece() {
    return this.args.currentPiece.id === this.args.piece.id;
  }
}
