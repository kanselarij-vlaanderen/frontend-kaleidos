import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export class DocumentTypesDataSource {
  store;

  @tracked options;

  static async create(store) {
    const dataSource = new DocumentTypesDataSource();
    dataSource.store = store;
    dataSource.options = await dataSource.query.perform();
  }

  @task
  *search(searchTerm) {
    yield timeout(300);
    return yield this.query.perform(searchTerm);
  }

  @task
  *query(searchTerm) {
    const query = {
      page: {
        size: PAGE_SIZE.SELECT,
      },
      sort: 'priority',
    };
    if (searchTerm) {
      query['filter[label]'] = searchTerm;
    }

    return yield this.store.query('document-type', query);
  }
}

export default class AccessLevelSelector extends Component { }
