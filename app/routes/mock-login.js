import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class MockLoginRoute extends Route {
  @service('session') simpleAuthSession;
  @service store;

  beforeModel() {
    this.simpleAuthSession.prohibitAuthentication('index');
  }

  model() {
    return this.store.query('account', {
      include: 'user',
      filter: {
        provider: CONSTANTS.SERVICE_PROVIDERS.MOCK_LOGIN,
      },
      sort: 'user.memberships.role.position',
      page: {
        size: 100,
        number: 0,
      },
    });
  }
}
