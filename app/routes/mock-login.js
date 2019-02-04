import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  queryParams: {
    page: {
      refreshModel: true
    }
  },
  session: service(),
  store: service(),
  beforeModel() {
    if (this.session.isAuthenticated)
      this.transitionTo('agendas');
  },
  model(params) {
    const filter = { provider: 'https://github.com/lblod/mock-login-service' };
    if (params.role)
      filter.user = { 'last-name': params.role};
    return this.store.query('account', {
      include: 'user,user.groups',
      filter: filter,
      page: { size: 10, number: params.page },
      sort: 'user.last-name'
    });
  }
});
