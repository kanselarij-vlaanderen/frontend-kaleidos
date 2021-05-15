import Controller from '@ember/controller';
import { timeout } from 'ember-concurrency';
import {
  lastValue,
  restartableTask,
  task
} from 'ember-concurrency-decorators';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class MockLoginController extends Controller {
  role = '';
  page = 0;
  size = 10;

  @lastValue('queryStore') accounts;

  init() {
    super.init(...arguments);
    this.queryStore.perform();
  }

  @task
  *queryStore() {
    const filter = {
      provider: CONFIG.mockLoginServiceProvider,
    };
    if (this.role) {
      filter.user = {
        'first-name': this.role,
      };
    }
    const accounts = yield this.store.query('account', {
      include: 'user,user.group',
      filter,
      sort: 'user.last-name,user.first-name',
      page: {
        size: this.size,
        number: this.page,
      },
    });
    return accounts;
  }

  @restartableTask
  *updateSearch(value) {
    yield timeout(500);
    this.set('page', 0);
    this.set('role', value);
    yield this.queryStore.perform();
  }
}
