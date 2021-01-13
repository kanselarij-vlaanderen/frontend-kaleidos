import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PieceDetailsEdit extends Component {
  @tracked documentTypes = [];
  @tracked selectedDocumentType;
  @tracked showLoader;
  @tracked documentContainer;
  @service store;

  constructor() {
    console.log('constructior');
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    if (!this.documentTypes.length) {
      this.documentTypes = yield this.store.query('document-type', {
        page: {
          size: 50,
        },
      });
    }
    this.documentContainer = yield this.args.piece.documentContainer;
    this.selectedDocumentType = yield this.documentContainer.get('type');
  }

  get sortedDocumentTypes() {
    return this.documentTypes.sortBy('priority');
  }

  @action
  selectDocumentType(value) {
    this.selectedDocumentType = value;
    this.args.piece.documentContainer.type = value;
  }
}
