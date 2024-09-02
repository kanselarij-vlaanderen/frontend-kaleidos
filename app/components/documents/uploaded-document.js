import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class UploadedDocument extends Component {
  @service conceptStore;

  @tracked documentTypes = [];
  @tracked documentContainer;
  @tracked selectedDocumentType;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    if (this.args.allowDocumentContainerEdit) {
      this.documentTypes = yield this.conceptStore.queryAllByConceptScheme(CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES);
      this.documentContainer = yield this.args.piece.documentContainer;
      this.selectedDocumentType = yield this.documentContainer.type;
    }
  }

  get sortedDocumentTypes() {
    return this.documentTypes
      .slice()
      .sort((d1, d2) => d1.position - d2.position);
  }

  @action
  selectDocumentType(value) {
    this.selectedDocumentType = value;
    this.documentContainer.type = value;
  }

  @action
  setAccessLevel(value) {
    this.args.piece.accessLevel = value;
    this.args.onAccessLevelChanged?.(this.args.piece);
  }
}
