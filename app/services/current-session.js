import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';
import { findGroupByRole } from 'frontend-kaleidos/config/permissions';

export default class CurrentSessionService extends Service {
  @service session;
  @service store;

  @tracked user;
  @tracked role;
  @tracked organization;

  /* eslint-disable ember/no-get */
  async load() {
    if (this.session.isAuthenticated) {
      const membershipId = get(this.session, 'data.authenticated.data.relationships.membership.data.id');
      if (membershipId) {
        const membership = await this.store.findRecord('membership', membershipId, {
          include: 'role,organization,user'
        });
        const [role, organization, user] = await Promise.all([
          membership.role,
          membership.organization,
          membership.user
        ]);
        this.role = role;
        this.organization = organization;
        this.user = user;

        const loginActivity = this.store.createRecord('login-activity', {
          startDate: new Date(),
          user: this.user,
        });
        await loginActivity.save();
      }
    }
  }
  /* eslint-enable ember/no-get */

  clear() {
    this.user = null;
    this.role = null;
    this.organization = null;
  }

  may(permission) {
    return this.userGroup?.permissions.includes(permission);
  }

  hasAccessToApplication() {
    return isPresent(this.role);
  }

  get userGroup() {
    return this.role && findGroupByRole(this.role.uri);
  }

  get isAdmin() {
    return this.userGroup.name == 'ADMIN';
  }

  get isOverheid() {
    return this.userGroup.name == 'OVERHEID';
  }
}
