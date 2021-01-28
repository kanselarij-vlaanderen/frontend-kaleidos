import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsIndexController extends Controller {
  queryParams = {
    page: {
      type: 'number',
    },
    size: {
      type: 'number',
    },
    sort: {
      type: 'string',
    },
  };

  sizeOptions = Object.freeze([5, 10, 25, 50, 100, 200]);

  @tracked page = 0;
  @tracked size = 5;
  @tracked sort = '-created';

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  navigateToPublication(publicationFlowRow) {
    this.transitionToRoute('publications.publication', publicationFlowRow.get('id'));
  }
}
