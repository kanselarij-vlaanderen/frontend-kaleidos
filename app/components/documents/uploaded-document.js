import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
// import CONSTANTS from 'frontend-kaleidos/config/constants';

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
    this.documentTypes = yield this.store.query('document-type', {
      page: {
        size: 50,
      },
    });
    // this.documentTypes = yield this.store.queryConceptsForConceptScheme(CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES);
    // TODO: Enable when https://github.com/kanselarij-vlaanderen/frontend-kaleidos/pull/1518 gets merged

    this.documentContainer = yield this.args.piece.documentContainer;
    this.selectedDocumentType = yield this.documentContainer.type;
  }

  get sortedDocumentTypes() {
    return this.documentTypes.sortBy('priority');
  }

  @action
  selectDocumentType(value) {
    this.selectedDocumentType = value;
    this.documentContainer.type = value;
  }
}
