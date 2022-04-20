import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AgendasRoute extends Route {
  @service router;
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  redirect() {
    this.transitionTo('agendas.overview');
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('newMeeting', this.store.createRecord('meeting'));
  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
