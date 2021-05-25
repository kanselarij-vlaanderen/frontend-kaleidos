import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';

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

  @tracked account;
  @tracked user;
  @tracked group;
  @tracked roles;

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

  get groupUri() {
    return this.group && this.group.uri;
  }

  get hasValidGroup() {
    return this.groupUri && this.groupUri !== USER;
  }

  get isAdmin() {
    return [ADMIN].includes(this.groupUri);
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
