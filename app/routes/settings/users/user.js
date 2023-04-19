import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SettingsUsersUserRoute extends Route {
  @service store;

  person

  model(params) {
    return this.store.findRecord('user', params.id, {
      include: 'memberships.organization,memberships.role,person'
    });
  }

  async afterModel(model) {
    this.person = await model.person
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.selectedPerson = this.person;
  }
}
