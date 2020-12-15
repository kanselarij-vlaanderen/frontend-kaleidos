import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
export default class NewsletterNotaUpdatesController extends Controller {
  queryParams = ['sort'];

  @tracked sort = '-modified';

  get size() {
    return this.model.length;
  }

  @action
  // eslint-disable-next-line class-methods-use-this
  showPieceViewer(pieceId) {
    window.open(`/document/${pieceId}`);
  }
}
