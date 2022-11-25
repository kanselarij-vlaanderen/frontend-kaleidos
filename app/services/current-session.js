import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';
import { findGroupByRole } from 'frontend-kaleidos/config/permissions';

export default class CurrentSessionService extends Service {
  @service session;
  @service store;
  @service impersonation;

  @tracked ownUser;
  @tracked ownRole;
  @tracked ownOrganization;
  @tracked ownMembership;

  get user() {
    return this.impersonation.user ?? this.ownUser;
  }

  get role() {
    return this.impersonation.role ?? this.ownRole;
  }

  get organization() {
    return this.impersonation.organization ?? this.ownOrganization;
  }

  get memberhsip() {
    return this.impersonation.membership ?? this.ownMembership;
  }

  /* eslint-disable ember/no-get */
  async load() {
    if (this.session.isAuthenticated) {
      const membershipId = get(this.session, 'data.authenticated.data.relationships.membership.data.id');
      if (membershipId) {
        this.ownMembership = await this.store.findRecord('membership', membershipId, {
          include: 'role,organization,user'
        });
        const [role, organization, user] = await Promise.all([
          this.ownMembership.role,
          this.ownMembership.organization,
          this.ownMembership.user
        ]);
        this.ownRole = role;
        this.ownOrganization = organization;
        this.ownUser = user;
      }
      await this.impersonation.load();
    }
  }
  /* eslint-enable ember/no-get */

  clear() {
    this.ownUser = null;
    this.ownRole = null;
    this.ownOrganization = null;
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
