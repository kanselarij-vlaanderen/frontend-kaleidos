import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationNavigation extends Component {
  @service store;

  @tracked documentsCount = 0;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const pieces = yield this.store.query('piece', {
      'filter[publication-flow][:id:]': this.args.publicationFlow.id,
      'page[size]': CONSTANTS.MAX_PAGE_SIZES.ONE_ITEM,
    });
    this.documentsCount = pieces.meta.count;
  }
}
