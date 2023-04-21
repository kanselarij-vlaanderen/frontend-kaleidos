import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SettingsUsersUserController extends Controller {
  @service store;

  @tracked membershipBeingBlocked = null;
  @tracked showBlockUser = false;
  @tracked showUnblockUser = false;
  @tracked showBlockMembership = false;
  @tracked showUnblockMembership = false;
  @tracked selectedPerson = null;

  @action
  async blockUser() {
    const blocked = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.BLOCKED
    );
    this.model.status = blocked;
    await this.model.save();
  }

  @action
  async unblockUser() {
    const allowed = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.ALLOWED
    );
    this.model.status = allowed;
    await this.model.save();
  }

  @action
  async blockMembership() {
    const blocked = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.BLOCKED
    );
    this.membershipBeingBlocked.status = blocked;
    await this.membershipBeingBlocked.save();
  }

  @action
  async unblockMembership() {
    const allowed = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.ALLOWED
    );
    this.membershipBeingBlocked.status = allowed;
    await this.membershipBeingBlocked.save();
  }

  @action
  async linkPerson() {
    this.model.person = this.selectedPerson;
    await this.model.save();
  }

  @action
  async unlinkPerson() {
    this.model.person = null;
    this.selectedPerson = null;
    await this.model.save();
  }
}
