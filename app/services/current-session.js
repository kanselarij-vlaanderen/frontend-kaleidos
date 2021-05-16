import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import CONFIG from 'frontend-kaleidos/utils/config';

const {
  adminId, kanselarijId, overheidId, ministerId, kabinetId, ovrbId, usersId,
} = CONFIG;

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

  get groupId() {
    return this.group && this.group.id;
  }

  get hasValidUserRole() {
    return this.groupId && this.groupId !== usersId;
  }

  get isOvrb() {
    return [ovrbId, adminId].includes(this.groupId);
  }

  get isOverheid() {
    return [overheidId].includes(this.groupId);
  }

  get isAdmin() {
    return [adminId].includes(this.groupId);
  }

  get isPublic() {
    return [adminId, kanselarijId, overheidId, ministerId, usersId, kabinetId].includes(this.groupId);
  }

  get isViewer() {
    return [adminId, kanselarijId, overheidId, ministerId, kabinetId].includes(this.groupId);
  }

  get isEditor() {
    return [kanselarijId, adminId].includes(this.groupId);
  }
}
