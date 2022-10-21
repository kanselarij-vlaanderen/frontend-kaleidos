import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SettingsOrganizationsIndexController extends Controller {
  @service store;

  @tracked size = 10;
  @tracked page = 0;
  @tracked sort = 'identifier';
  @tracked filter;

  @tracked isLoadingModel = false;

  @tracked organizationBeingBlocked = null;

  @tracked showBlockOrganization = false;
  @tracked showUnblockOrganization = false;

  @tracked organizations = [];
  @tracked selectedOrganizations = [];
  @tracked showBlockedOrganizations = false;

  @action
  setOrganizations(organizations) {
    this.organizations = organizations.map((organization) => organization.id);
    this.selectedOrganizations = organizations;
  }

  @task
  *loadSelectedOrganizations() {
    this.selectedOrganizations = (yield Promise.all(this.organizations.map((id) => this.store.findRecord('user-organization', id)))).toArray();
  }

  @task
  *blockOrganization() {
    const blocked = yield this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.BLOCKED
    );
    yield this.updateOrganizationStatus.perform(blocked);
  }

  @task
  *unblockOrganization() {
    const allowed = yield this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.ALLOWED
    );
    yield this.updateOrganizationStatus.perform(allowed);
  }

  @task
  *updateOrganizationStatus(status) {
    this.organizationBeingBlocked.status = status;
    yield this.organizationBeingBlocked.save();

    const memberships = yield this.store.queryAll('membership', {
      filter: {
        organization: {
          ':id:': this.organizationBeingBlocked.id,
        },
      },
    });

    // Block all memberships, 10 at a time
    yield Promise.all(
      memberships
        .toArray()
        .map((membership) =>
          this.updateMembershipStatus.perform(membership, status)
        )
    );
  }

  @task({ maxConcurrency: 10, enqueue: true })
  *updateMembershipStatus(membership, status) {
    membership.status = status;
    yield membership.save();
  }
}
