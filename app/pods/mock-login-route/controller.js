import Controller from '@ember/controller';
import {
  task, timeout
} from 'ember-concurrency';
import CONFIG from 'frontend-kaleidos/utils/config';

export default Controller.extend({
  queryParams: ['role', 'page'],
  role: '',
  page: 0,
  size: 10,

  queryStore: task(function *() {
    const filter = {
      provider: CONFIG.mockLoginServiceProvider,
    };
    if (this.role) {
      filter.user = {
        'last-name': this.role,
      };
    }
    const accounts = yield this.store.query('account', {
      include: 'user,user.groups',
      filter,
      page: {
        size: this.size, number: this.page,
      },
      sort: 'user.last-name',
    });
    return accounts;
  }),
  updateSearch: task(function *(value) {
    yield timeout(500);
    this.set('page', 0);
    this.set('role', value);
    const model = yield this.queryStore.perform();
    this.set('model', model);
  }).restartable(),
});
