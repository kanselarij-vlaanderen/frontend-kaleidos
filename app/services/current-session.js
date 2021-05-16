import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { waitForProperty } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import CONFIG from 'frontend-kaleidos/utils/config';

const {
  adminId, kanselarijId, overheidId, ministerId, kabinetId, ovrbId, usersId,
} = CONFIG;

export default class CurrentSessionService extends Service {
  @service session;
  @service store;

  @tracked userRole;
  @tracked userRoleId;

  @tracked account;
  @tracked roles;

  async load() {
    if (this.session.isAuthenticated) {
      const accountId = get(this.session, 'data.authenticated.relationships.account.data.id');
      this.account = await this.store.find('account', accountId);
      const user = await this.account.get('user');

      let group = null;
      const groupId = get(this.session, 'data.authenticated.relationships.group.data.id');
      if (groupId) {
        group = await this.store.find('account-group', groupId);
      }

      if (group && group.name) {
        this.userRole = group.name;
        this.userRoleId = group.id;
      } else {
        this.userRole = 'no-access';
        this.userRoleId = null;
      }

      this.roles = get(this.session, 'data.authenticated.data.attributes.roles');

      this.set('_user', user);
      this.set('_group', group);
      // The naming is off, but account,user,roles are taken for the
      // promises in a currently public API.
      this.setProperties({
        userContent: user,
        groupContent: group,
      });
    }
  }

  get hasValidUserRole() {
    return this.userRole && this.userRole !== 'no-access' && this.userRole !== 'users';
  }

  get hasNoAccess() {
    return !this.userRole || this.userRole === 'no-access';
  }

  get isOvrb() {
    return [ovrbId, adminId].includes(this.userRoleId);
  }

  get isOverheid() {
    return [overheidId].includes(this.userRoleId);
  }

  get isAdmin() {
    return [adminId].includes(this.userRoleId);
  }

  get isPublic() {
    return [adminId, kanselarijId, overheidId, ministerId, usersId, kabinetId].includes(this.userRoleId);
  }

  get isViewer() {
    return [adminId, kanselarijId, overheidId, ministerId, kabinetId].includes(this.userRoleId);
  }

  get isEditor() {
    return [kanselarijId, adminId].includes(this.userRoleId);
  }

  // constructs a task which resolves in the promise
  @task
  *makePropertyPromise(property) {
    yield waitForProperty(this, property);
    return this.get(property);
  }

  // this contains a promise
  get user() {
    return this.makePropertyPromise.perform('_user');
  }

  // this contains a promise
  get group() {
    return this.makePropertyPromise.perform('_group');
  }
}
