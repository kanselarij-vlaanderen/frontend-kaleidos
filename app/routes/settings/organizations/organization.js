import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SettingsOrganizationsOrganizationRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('user-organization', params.id, {
      include: 'memberships,mandatees'
    });
  }

  async afterModel(model) {
    this.linkedMandatees = (await model.mandatees)?.toArray();
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.linkedMandatees = this.linkedMandatees
  }
}