import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
export default class NewsletterUpdatesController extends Controller {
  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);
  queryParams = ['sort'];

  @tracked page;
  @tracked size;
  @tracked sort = '-modified';

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  showDocumentVersionViewer = (documentId) => {
    window.open(`/document/${documentId}`);
  };
}
