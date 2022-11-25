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
  @tracked role;
  @tracked organization;
  @tracked membership;

  get ownUser() {
    return this.impersonation.user ?? this.user;
  }

  get ownRole() {
    return this.impersonation.role ?? this.role;
  }

  get ownOrganization() {
    return this.impersonation.organization ?? this.organization;
  }

  get ownMembership() {
    return this.impersonation.membership ?? this.membership;
  }

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
        this.role = role;
        this.organization = organization;
        this.user = user;
      }
      await this.impersonation.load();
    }
  }
  /* eslint-enable ember/no-get */

  clear() {
    this.user = null;
    this.role = null;
    this.organization = null;
    this.impersonation.clear();
  }

  may(permission) {
    return this.userGroup?.permissions.includes(permission);
  }

  reallyMay(permission) {
    return this.ownUserGroup?.permissions.includes(permission);
  }

  hasAccessToApplication() {
    return isPresent(this.role);
  }

  get userGroup() {
    return this.role && findGroupByRole(this.role.uri);
  }

  get ownUserGroup() {
    return this.ownRole && findGroupByRole(this.ownRole.uri);
  }

  get isAdmin() {
    return this.userGroup.name == 'ADMIN';
  }

  get isReallyAdmin() {
    return this.ownUserGroup.name == 'ADMIN';
  }
}
