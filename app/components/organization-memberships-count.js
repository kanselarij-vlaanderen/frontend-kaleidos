import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @param organization {UserOrganization} The organization whose memberships we will count
 */
export default class OrganizationMembershipsCountComponent extends Component {
  @service store;

  @tracked membershipsCount;

  constructor() {
    super(...arguments);
    this.loadMemberships.perform();
  }

  @task
  *loadMemberships() {
    this.membershipsCount = yield this.store.count('membership', {
      filter: {
        organization: {
          ':id:': this.args.organization.id,
        }
      }
    });
  }
}
