import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class PublicationsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @action
  refreshModel() {
    this.refresh();
  }

  @action
  refresh() {
    super.refresh();
  }
}
