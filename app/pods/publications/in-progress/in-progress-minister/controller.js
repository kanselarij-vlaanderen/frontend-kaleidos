import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsInProgressNotMinisterController extends Controller {
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

  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);

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

  @action
  async hasBvr(_case) {
    return await _case.hasBvr();
  }

  @action
  async hasDecreet(_case) {
    return await _case.hasDecreet();
  }
}
