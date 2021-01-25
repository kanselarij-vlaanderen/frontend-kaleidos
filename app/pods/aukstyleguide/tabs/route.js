import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default class TabsRoute extends Route.extend(AuthenticatedRouteMixin) {
  model() {
    // Normally we would query store here, but for now, we get the mocks
    return null;
  }
}
