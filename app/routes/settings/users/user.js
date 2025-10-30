import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SettingsUsersUserRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('user', params.id, {
      include: 'memberships.organization,memberships.role',
    });
  }

  async afterModel(model) {
    await model.person;
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.selectedPerson = model.person;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.membershipBeingBlocked = null;
      controller.showBlockUser = false;
      controller.showUnblockUser = false;
      controller.showBlockMembership = false;
      controller.showUnblockMembership = false;
    }
  }
}
