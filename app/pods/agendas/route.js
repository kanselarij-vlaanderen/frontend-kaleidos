import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-mixins
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default class AgendasRoute extends Route.extend(DataTableRouteMixin) {
  @service store;
  @service router;
  @service('session') simpleAuthSession;

  modelName = 'agenda';

  mergeQueryOptions() {
    return {
      'filter[:has-no:next-version]': true,
    };
  };

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }


  @action
  refreshRoute() {
    this.refresh();
  }
}
