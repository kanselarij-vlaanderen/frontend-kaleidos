import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
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

  visibleRoles = [
    CONSTANTS.MANDATE_ROLES.MINISTER_PRESIDENT,
    CONSTANTS.MANDATE_ROLES.MINISTER,
    CONSTANTS.MANDATE_ROLES.VOORZITTER,
    CONSTANTS.MANDATE_ROLES.GEMEENSCHAPSMINISTER,
    CONSTANTS.MANDATE_ROLES.SECRETARIS,
    CONSTANTS.MANDATE_ROLES.WAARNEMEND_SECRETARIS,
  ];

  blockUser = task(async () => {
    const blocked = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.BLOCKED
    );
    this.model.status = blocked;
    await this.model.save();
  });

  unblockUser = task(async () => {
    const allowed = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.ALLOWED
    );
    this.model.status = allowed;
    await this.model.save();
  });

  blockMembership = task(async () => {
    const blocked = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.BLOCKED
    );
    this.membershipBeingBlocked.status = blocked;
    await this.membershipBeingBlocked.save();
  });

  unblockMembership = task(async () => {
    const allowed = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.ALLOWED
    );
    this.membershipBeingBlocked.status = allowed;
    await this.membershipBeingBlocked.save();
  });

  @action
  async linkPerson() {
    this.selectedPerson.user = this.model;
    await this.selectedPerson.save();
  }

  @action
  async unlinkPerson() {
    const person = await this.model.person;
    person.user = null;
    this.selectedPerson = null;
    await person.save();
    await this.model.belongsTo('person').reload();
  }
}
