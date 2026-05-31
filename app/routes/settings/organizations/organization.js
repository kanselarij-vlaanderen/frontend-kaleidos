import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SettingsOrganizationsOrganizationRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('user-organization', params.id, {
      include: 'memberships,mandatees',
    });
  }

  async afterModel(model) {
    this.linkedMandatees = (await model.mandatees)?.slice();
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.linkedMandatees = this.linkedMandatees;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.mandateeBeingUnlinked = null;
      controller.showBlockOrganization = false;
      controller.showUnblockOrganization = false;
      controller.showUnlinkMandatee = false;
      controller.showSelectMandateeModal = false;
    }
  }
}
