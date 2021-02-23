import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';

export default Route.extend({
  queryParams: {
    page: {
      refreshModel: true,
    },
  },

  currentSession: service(),
  session: service(),
  store: service(),

  beforeModel() {
    if (this.currentSession.userRole === '') {
      this.transitionTo('accountless-users');
    }
    if (this.session.isAuthenticated) {
      this.transitionTo('agendas');
    }
  },
  model(params) {
    const filter = {
      provider: CONFIG.mockLoginServiceProvider,
    };
    if (params.role) {
      filter.user = {
        'last-name': params.role,
      };
    }
    return this.store.query('account', {
      include: 'user,user.group',
      filter,
      sort: 'user.last-name',
    });
  },
});
