import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';

export default class PublicationNavigation extends Component {
  @service store;

  @tracked documentsCount = 0;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const pieces = yield this.store.query('piece',
      {
        'filter[cases][publication-flow][:uri:]': this.args.publicationFlow.uri,
        'page[size]': 1,
      }
    );
    this.documentsCount = pieces.meta.count;
  }
}
