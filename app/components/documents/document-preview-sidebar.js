import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class DocumentsDocumentPreviewSidebar extends Component {
  @tracked documentType;
  @tracked accessLevel;

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
}
