import Component from '@glimmer/component';
import { service } from '@ember/service';
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

  loadMemberships = task(async () => {
    this.membershipsCount = await this.store.count('membership', {
      filter: {
        organization: {
          ':id:': this.args.organization.id,
        }
      }
    });
  });
}
