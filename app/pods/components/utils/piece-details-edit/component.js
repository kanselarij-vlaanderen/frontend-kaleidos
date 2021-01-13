import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class PieceDetailsEdit extends Component {
  @tracked documentTypes = [];
  @tracked selectedDocumentType;

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
    this.selectedDocumentType = yield this.documentContainer.type;
  }

  get sortedDocumentTypes() {
    return this.documentTypes.sortBy('priority');
  }
}
