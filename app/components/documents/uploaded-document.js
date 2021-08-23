import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action, get } from '@ember/object';

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

    this.documentContainer = yield this.args.piece.documentContainer;
    this.selectedDocumentType = yield this.documentContainer.type;
  }

  get downloadLink() {
    // eslint-disable-next-line ember/no-get
    return get(this.args.piece.file, 'namedDownloadLink');
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
