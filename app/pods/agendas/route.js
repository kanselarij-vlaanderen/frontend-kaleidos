import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class AgendasRoute extends Route {
  @service router;
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  afterModel() {
    return this.store.query('meeting-kind', {
      'page[size]': PAGE_SIZE.MEETING_KIND,
      filter: {
        ':has:priority': true,
      },
      sort: 'priority',
    });
  }

  redirect() {
    this.router.transitionTo('agendas.overview');
  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
