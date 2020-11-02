import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default class CaseRoute extends Route.extend(AuthenticatedRouteMixin) {
  setupController(controller, model) {
    super.setupController(...arguments);
    // model is publication-flow
    controller.set('model', model);
  }
}
