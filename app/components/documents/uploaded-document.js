import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class UploadedDocument extends Component {
  @service store;

  @tracked documentTypes = [];
  @tracked documentContainer;
  @tracked selectedDocumentType;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.documentTypes = yield this.store.query('concept', {
      'filter[concept-schemes][:uri:]': CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES,
      page: {
        size: PAGE_SIZE.CODE_LISTS,
      },
    });

    this.documentContainer = yield this.args.piece.documentContainer;
    this.selectedDocumentType = yield this.documentContainer.type;
  }

  get sortedDocumentTypes() {
    return this.documentTypes.sortBy('position');
  }

  @action
  selectDocumentType(value) {
    this.selectedDocumentType = value;
    this.documentContainer.type = value;
  }
}
