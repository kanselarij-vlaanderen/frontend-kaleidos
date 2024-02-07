import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';
import { findGroupByRole } from 'frontend-kaleidos/config/permissions';

export default class CurrentSessionService extends Service {
  @service session;
  @service store;
  @service impersonation;

  @tracked user;
  @tracked organization;
  @tracked membership;
  @tracked role;

  /* eslint-disable ember/no-get */
  async load() {
    if (this.session.isAuthenticated) {
      const membershipId = get(this.session, 'data.authenticated.data.relationships.membership.data.id');
      if (membershipId) {
        this.membership = await this.store.findRecord('membership', membershipId, {
          include: 'role,organization,user'
        });
        const [role, organization, user] = await Promise.all([
          this.membership.role,
          this.membership.organization,
          this.membership.user
        ]);
        this.organization = organization;
        this.user = user;
        this.role = role;
      }
      await this.impersonation.load();
    }
  }
  /* eslint-enable ember/no-get */

  clear() {
    this.user = null;
    this.role = null;
    this.organization = null;
    this.impersonation.stopImpersonation();
  }

  may(permission, checkImpersonator = false) {
    return checkImpersonator
      ? this.impersonatorUserGroup?.permissions.includes(permission)
      : this.userGroup?.permissions.includes(permission);
  }

  hasAccessToApplication() {
    return isPresent(this.role);
  }

  get userGroup() {
    return this.impersonation.role
      ? findGroupByRole(this.impersonation.role.uri)
      : this.impersonatorUserGroup;
  }

  get impersonatorUserGroup() {
    return this.role && findGroupByRole(this.role.uri);
  }

  get isAdmin() {
    return this.userGroup.name == 'ADMIN';
  }

  get isImpersonator() {
    return isPresent(this.impersonation.role);
  }
}
