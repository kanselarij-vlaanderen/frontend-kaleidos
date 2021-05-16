import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class MockLoginRoute extends Route {
  @service('session') simpleAuthSession;

  beforeModel() {
    this.simpleAuthSession.prohibitAuthentication('agendas');
  }

  model() {
    return this.store.query('account', {
      include: 'user,user.group',
      filter: {
        provider: CONFIG.mockLoginServiceProvider,
      },
      sort: 'user.last-name,user.first-name',
      page: {
        size: 100,
        number: 0,
      },
    });
  }
}
