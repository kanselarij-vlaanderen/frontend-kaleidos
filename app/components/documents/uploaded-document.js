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
  @tracked selectedAccessLevel;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  async setDefaultSelectedAccessLevel() {
    const accessLevels = await this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.ACCESS_LEVELS
    );
    this.selectedAccessLevel = accessLevels.find(
      (concept) => concept.uri === CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );
  }

  @task
  *loadData() {
    if (this.args.allowDocumentContainerEdit) {
      yield this.setDefaultSelectedAccessLevel();
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
  setPieceAccessLevel(accessLevel) {
    this.args.piece.accessLevel = accessLevel;
    this.selectedAccessLevel = accessLevel;
  }

  @action
  selectDocumentType(value) {
    this.selectedDocumentType = value;
    this.documentContainer.type = value;
  }
}
