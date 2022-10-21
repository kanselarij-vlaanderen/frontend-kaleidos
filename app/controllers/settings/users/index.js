import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { LIVE_SEARCH_DEBOUNCE_TIME } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import formatDate from 'frontend-kaleidos/utils/format-date-search-param';

export default class UsersSettingsController extends Controller {
  @service store;

  sizeOptions = [5, 10, 20, 50, 100, 200];
  @tracked size = 10;
  @tracked page = 0;
  @tracked sort = 'first-name';
  @tracked filter;

  @tracked searchTextBuffer;

  @tracked userBeingBlocked = null;
  @tracked membershipsBeingBlocked = [];

  @tracked showBlockMembership = false;
  @tracked showBlockUser = false;
  @tracked showUnblockMembership = false;
  @tracked showUnblockUser = false;

  @tracked organizations = [];
  @tracked selectedOrganizations = [];
  @tracked dateFrom;
  @tracked _dateFromBuffer;
  @tracked dateTo;
  @tracked _dateToBuffer;
  @tracked roles = [];
  @tracked selectedRoles = [];
  @tracked showBlockedUsers = false;
  @tracked showBlockedMemberships = false;

  @tracked isLoadingModel = false;

  get dateToBuffer() {
    return this._dateToBuffer;
  }

  set dateToBuffer(date) {
    this._dateToBuffer = date;
    this.dateTo = formatDate(date);
  }

  get dateFromBuffer() {
    return this._dateFromBuffer;
  }

  set dateFromBuffer(date) {
    this._dateFromBuffer = date;
    this.dateFrom = formatDate(date);
  }

  @action
  setOrganizations(organizations) {
    this.organizations = organizations.map((organization) => organization.id);
    this.selectedOrganizations = organizations;
  }

  @task
  *setRoles(roles) {
    yield timeout(LIVE_SEARCH_DEBOUNCE_TIME);
    this.roles = roles.map((role) => role.id);
    this.selectedRoles = roles;
  }

  @action
  search(e) {
    e.preventDefault();
    this.filter = this.searchTextBuffer;
  }

  @action
  toggleShowBlockMembership() {
    this.showBlockMembership = !this.showBlockMembership;
    this.membershipsBeingBlocked = [];
  }

  @action
  toggleShowUnblockMembership() {
    this.showUnblockMembership = !this.showUnblockMembership;
    this.membershipsBeingBlocked = [];
  }

  @action
  toggleMembershipBeingBlocked(membership, isChecked) {
    if (isChecked) {
      this.membershipsBeingBlocked.addObject(membership);
    } else {
      this.membershipsBeingBlocked.removeObject(membership);
    }
  }

  @action
  async blockUser() {
    const blocked = await this.store.findRecordByUri('concept', CONSTANTS.USER_ACCESS_STATUSES.BLOCKED);
    this.userBeingBlocked.status = blocked;
    await this.userBeingBlocked.save();
  }

  @action
  async unblockUser() {
    const allowed = await this.store.findRecordByUri('concept', CONSTANTS.USER_ACCESS_STATUSES.ALLOWED);
    this.userBeingBlocked.status = allowed;
    await this.userBeingBlocked.save();
  }

  @action
  async blockMemberships() {
    const blocked = await this.store.findRecordByUri('concept', CONSTANTS.USER_ACCESS_STATUSES.BLOCKED);
    for (const membership of this.membershipsBeingBlocked) {
      membership.status = blocked;
    }
    await Promise.all(this.membershipsBeingBlocked.map((membership) => membership.save()));
  }

  @action
  async unblockMemberships() {
    const allowed = await this.store.findRecordByUri('concept', CONSTANTS.USER_ACCESS_STATUSES.ALLOWED);
    for (const membership of this.membershipsBeingBlocked) {
      membership.status = allowed;
    }
    await Promise.all(this.membershipsBeingBlocked.map((membership) => membership.save()));
  }

  @action
  filterMemberships(memberships) {
    return memberships.filter((membership) => {
      const shouldShow = !this.showBlockedMemberships || membership.get('isBlocked');
      return this.roles.includes(membership.get('role.id')) && shouldShow;
    });
  }
}
