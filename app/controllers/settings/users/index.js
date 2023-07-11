import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { LIVE_SEARCH_DEBOUNCE_TIME } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import formatDate from 'frontend-kaleidos/utils/format-date-search-param';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import { addObject, removeObject } from 'frontend-kaleidos/utils/array-helpers';

export default class UsersSettingsController extends Controller {
  @service store;

  @tracked size = PAGINATION_SIZES[1];
  @tracked page = 0;
  @tracked sort = 'first-name';
  @tracked filter;

  @tracked searchTextBuffer;

  @tracked userBeingBlocked = null;
  @tracked membershipsBeingBlocked = [];

  @tracked showBlockMembershipsConfirmationModal = false;
  @tracked showBlockUserConfirmationModal = false;
  @tracked showUnblockMembershipsConfirmationModal = false;
  @tracked showUnblockUserConfirmationModal = false;

  @tracked organizations = [];
  @tracked selectedOrganizations = [];
  @tracked dateFrom;
  @tracked _dateFromBuffer;
  @tracked dateTo;
  @tracked _dateToBuffer;
  @tracked roles = [];
  @tracked selectedRoles = [];
  @tracked showBlockedUsersOnly = false;
  @tracked showBlockedMembershipsOnly = false;

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

  @task
  *loadSelectedOrganizations() {
    this.selectedOrganizations = (yield Promise.all(this.organizations.map((id) => this.store.findRecord('user-organization', id)))).slice();
  }

  @task
  *loadSelectedRoles() {
    this.selectedRoles = (yield Promise.all(this.roles.map((id) => this.store.findRecord('role', id)))).slice();
  }

  @action
  toggleShowBlockMembershipsConfirmationModal() {
    this.showBlockMembershipsConfirmationModal = !this.showBlockMembershipsConfirmationModal;
    this.membershipsBeingBlocked = [];
  }

  @action
  toggleShowUnblockMembershipsConfirmationModal() {
    this.showUnblockMembershipsConfirmationModal = !this.showUnblockMembershipsConfirmationModal;
    this.membershipsBeingBlocked = [];
  }

  @action
  toggleMembershipBeingBlocked(membership, isChecked) {
    if (isChecked) {
      addObject(this.membershipsBeingBlocked, membership);
    } else {
      removeObject(this.membershipsBeingBlocked, membership);
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

  /* Takes in a list of memberships (from a user's hasMany relation) and filters
   * them based on the user-set filters on this page, i.e. the roles and blocked
   * status. We use this in the template to only show the memberships which
   * currently match the filtering options.
   */
  @action
  async filterMemberships(membershipsPromise) {
    const memberships = await membershipsPromise;
    return memberships.filter((membership) => {
      const shouldShow = !this.showBlockedMembershipsOnly || membership.get('isBlocked');
      return this.roles.includes(membership.get('role.id')) && shouldShow;
    });
  }
}
