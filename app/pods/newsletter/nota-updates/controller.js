import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
export default class NewsletterNotaUpdatesController extends Controller {
  queryParams = ['sort'];

  @tracked page;
  @tracked sort = '-modified';

  constructor() {
    super(...arguments);
    this.page = 0;
  }

  @action
  // eslint-disable-next-line class-methods-use-this
  showDocumentVersionViewer(documentId) {
    window.open(`/document/${documentId}`);
  }
}
