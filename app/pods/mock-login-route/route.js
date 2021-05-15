import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MockLoginRoute extends Route {
  @service('session') simpleAuthSession;

  beforeModel() {
    this.simpleAuthSession.prohibitAuthentication('agendas');
  }
}
