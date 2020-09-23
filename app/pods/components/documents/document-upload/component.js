import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class DocumentUpload extends Component {
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
    if (!this.documentTypes.length) {
      this.documentTypes = yield this.store.query('document-type', {
        page: {
          size: 50,
        },
      });
    }

    this.documentContainer = yield this.args.document.documentContainer;
    this.selectedDocumentType = yield this.documentContainer.type;
  }

  get downloadLink() {
    const file = this.args.document.file;
    return `${file.get('downloadLink')}?name=${file.get('filename')}`;
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
