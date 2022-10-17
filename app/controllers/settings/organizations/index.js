import Controller from '@ember/controller';
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

  @tracked organizationBeingBlocked = null;

  @tracked showBlockOrganization = false;
  @tracked showUnblockOrganization = false;

  @task
  *blockOrganization() {
    const blocked = yield this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.BLOCKED
    );

    this.organizationBeingBlocked.status = blocked;
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
          this.updateMembershipStatus.perform(membership, blocked)
        )
    );
  }

  @task
  *unblockOrganization() {
    const allowed = yield this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.ALLOWED
    );

    this.organizationBeingBlocked.status = allowed;
    yield this.organizationBeingBlocked.save();

    const memberships = yield this.store.queryAll('membership', {
      filter: {
        organization: {
          ':id:': this.organizationBeingBlocked.id,
        },
      },
    });

    // Unblock all memberships, 10 at a time
    yield Promise.all(
      memberships
        .toArray()
        .map((membership) =>
          this.updateMembershipStatus.perform(membership, allowed)
        )
    );
  }

  @task({ maxConcurrency: 10, enqueue: true })
  *updateMembershipStatus(membership, status) {
    membership.status = status;
    yield membership.save();
  }
}
