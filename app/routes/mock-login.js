import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  queryParams: {
    page: {
      refreshModel: true
    }
  },

  currentSession: service(),
  session: service(),
  store: service(),

  beforeModel() {
    if (this.currentSession.userRole == '') {
      this.transitionTo('accountless-users');
    }
    if (this.session.isAuthenticated) {
      this.transitionTo('agendas');
    }
  },
  model(params) {
    const filter = { provider: 'https://github.com/kanselarij-vlaanderen/mock-login-service' };
    if (params.role) {
      filter.user = { 'last-name': params.role };
    }
    return this.store.query('account', {
      include: 'user,user.group',
      filter: filter,
      sort: 'user.last-name'
    });
  }
});
