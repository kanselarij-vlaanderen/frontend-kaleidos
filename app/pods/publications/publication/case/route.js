import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default class CaseRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model() {
    const publicationFlow = this.modelFor('publications.publication');
    const _case = await publicationFlow.get('case');
    return _case;
  }

  async setupController(controller) {
    super.setupController(...arguments);
    const publicationFlow = this.modelFor('publications.publication');
    const contactPersons = await publicationFlow.get('contactPersons');
    controller.set('contactPersons', contactPersons);
    controller.set('publicationFlow', publicationFlow);
  }
}
