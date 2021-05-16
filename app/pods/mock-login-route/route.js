import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class MockLoginRoute extends Route {
  @service('session') simpleAuthSession;

  beforeModel() {
    this.simpleAuthSession.prohibitAuthentication('agendas');
  }

  model() {
    return this.store.query('account', {
      include: 'user,user.group',
      filter: {
        provider: CONSTANTS.SERVICE_PROVIDERS.MOCK_LOGIN,
      },
      sort: 'user.last-name,user.first-name',
      page: {
        size: 100,
        number: 0,
      },
    });
  }
}
