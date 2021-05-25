import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default class NewslettersRoute extends Route.extend(DataTableRouteMixin) {
  @service('session') simpleAuthSession;

  modelName = 'meeting';

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }
}
