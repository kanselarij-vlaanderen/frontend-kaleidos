import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import groupRoles from 'frontend-kaleidos/config/roles';

const {
  ADMIN,
  KANSELARIJ,
  OVRB,
  MINISTER,
  KABINET,
  OVERHEID,
  USER,
} = CONSTANTS.ACCOUNT_GROUPS;

export default class CurrentSessionService extends Service {
  @service session;
  @service store;
  @service router;

  @tracked account;
  @tracked user;
  @tracked group;
  @tracked roles;

  /* eslint-disable ember/no-get */
  async load() {
    if (this.session.isAuthenticated) {
      const accountId = get(this.session, 'data.authenticated.relationships.account.data.id');
      this.account = await this.store.find('account', accountId);
      this.user = await this.account.user;

      const groupId = get(this.session, 'data.authenticated.relationships.group.data.id');
      if (groupId) {
        this.group = await this.store.find('account-group', groupId);
      }

      this.roles = get(this.session, 'data.authenticated.data.attributes.roles');
    }
  }
  /* eslint-enable ember/no-get */

  requireAuthorization(transition, roleName) {
    let isAuthenticated = this.session.requireAuthentication(transition, 'login');
    if (!isAuthenticated) {
      return false;
    }
    let isAuthorized = this.may(roleName);
    if (!isAuthorized) {
      this.transitionTo('agendas');
      return false;
    }
    return true;
  }

  may(roleName) {
    return groupRoles.get(this.group.uri).includes(roleName);
  }

  get groupUri() {
    return this.group && this.group.uri;
  }

  get hasValidGroup() {
    return this.groupUri && this.groupUri !== USER;
  }

  get isAdmin() {
    return [ADMIN].includes(this.groupUri);
  }

  get isKabinet() {
    return [KABINET].includes(this.groupUri);
  }

  get isMinister() {
    return [MINISTER].includes(this.groupUri);
  }

  get isOvrb() {
    return [ADMIN, OVRB].includes(this.groupUri);
  }

  get isOverheid() {
    return [OVERHEID].includes(this.groupUri);
  }

  get isPublic() {
    return [ADMIN, KANSELARIJ, MINISTER, KABINET, OVERHEID, USER].includes(this.groupUri);
  }

  get isViewer() {
    return [ADMIN, KANSELARIJ, MINISTER, KABINET, OVERHEID].includes(this.groupUri);
  }

  get isEditor() {
    return [ADMIN, KANSELARIJ].includes(this.groupUri);
  }
}
