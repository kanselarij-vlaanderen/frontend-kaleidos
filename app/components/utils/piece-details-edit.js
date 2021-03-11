import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import {
  set,
  action
} from '@ember/object';
import { inject as service } from '@ember/service';

export default class PieceDetailsEdit extends Component {
  @tracked documentTypes = [];
  @tracked selectedDocumentType;
  @tracked showLoader;
  @tracked documentContainer;
  @service store;

  constructor() {
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
    if (this.documentTypes) {
      return this.documentTypes.sortBy('priority');
    }
    return [];
  }

  @action
  selectDocumentType(value) {
    this.selectedDocumentType = value;
    set(this.args.piece.documentContainer, 'type', value);
  }
}
