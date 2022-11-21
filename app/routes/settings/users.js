import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SettingsUsersRoute extends Route {
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.may('manage-users')) {
      this.router.transitionTo('index');
    }
  }
}
