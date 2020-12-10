import Service, { inject as service } from '@ember/service';

import {
  get, computed
} from '@ember/object';
import {
  task, waitForProperty
} from 'ember-concurrency';
import CONFIG from 'fe-redpencil/utils/config';

export default Service.extend({
  session: service('session'),
  store: service('store'),
  router: service(),

  async logout() {
    await this.get('session').invalidate();
  },

  async load() {
    if (this.get('session.isAuthenticated')) {
      const {
        session,
      } = this;
      const account = await this.store.find(
        'account',
        get(session, 'data.authenticated.relationships.account.data.id')
      );
      const user = await account.get('user');

      let group = null;
      const groupId = get(session, 'data.authenticated.relationships.group.data.id');
      if (groupId) {
        group = await this.store.find('account-group', groupId);
      }
      const roles = await get(session, 'data.authenticated.data.attributes.roles');
      this.set('_account', account);
      this.set('_user', user);
      this.set('_roles', roles);
      this.set('_group', group);
      // The naming is off, but account,user,roles are taken for the
      // promises in a currently public API.
      this.setProperties({
        accountContent: account,
        userContent: user,
        rolesContent: roles,
        groupContent: group,
      });

      if (group && group.get('name')) {
        this.set('userRole', group.get('name'));
        this.set('userRoleId', group.get('id'));
      } else {
        this.set('userRole', 'no-access');
        this.set('userRoleId', null);
      }

      this.set('isPublic', this.checkPublicRights());
      this.set('isViewer', this.checkViewRights());
      this.set('isEditor', this.checkEditRights());
      this.set('isAdmin', this.checkAdminRights());
      this.set('isOverheid', this.checkGovernmentRights());
      this.set('isOvrb', this.checkOvrbRights());
    }
  },

  checkOvrbRights() {
    const {
      userRoleId,
    } = this;
    const {
      ovrbId,
    } = CONFIG;
    const roles = [ovrbId];
    return roles.includes(userRoleId);
  },

  checkGovernmentRights() {
    const {
      userRoleId,
    } = this;
    const {
      priviligedId,
    } = CONFIG;
    const roles = [priviligedId];
    return roles.includes(userRoleId);
  },

  checkPublicRights() {
    const {
      userRoleId,
    } = this;
    const {
      adminId, kanselarijId, priviligedId, ministerId, usersId, kabinetId,
    } = CONFIG;
    const roles = [adminId, kanselarijId, priviligedId, ministerId, usersId, kabinetId];
    return roles.includes(userRoleId);
  },

  checkViewRights() {
    const {
      userRoleId,
    } = this;
    const {
      adminId, kanselarijId, priviligedId, ministerId, kabinetId,
    } = CONFIG;
    const roles = [adminId, kanselarijId, priviligedId, ministerId, kabinetId];
    return roles.includes(userRoleId);
  },

  checkEditRights() {
    const {
      userRoleId,
    } = this;
    const {
      adminId, kanselarijId,
    } = CONFIG;
    const roles = [adminId, kanselarijId];
    return roles.includes(userRoleId);
  },

  checkAdminRights() {
    const {
      userRoleId,
    } = this;
    const {
      adminId,
    } = CONFIG;
    const roles = [adminId];
    return roles.includes(userRoleId);
  },

  checkIsDeveloper() {
    // The keys in this whitelist are only indicative
    // They are not used, but use them to describe who the id belongs to
    // Get these from https://kaleidos.vlaanderen.be, and then check the user id via the ember data tab
    const whitelist = {
      frederik: CONFIG.frederik,
      ben: CONFIG.ben,
      rafael: CONFIG.rafael,
    };

    const user = this.get('user');

    return Object.keys(whitelist).some((developer) => {
      const whitelistedDeveloperId = whitelist[developer];
      const currentUserId = user.get('id');

      return currentUserId === whitelistedDeveloperId;
    });
  },

  // constructs a task which resolves in the promise
  makePropertyPromise: task(function *(property) {
    yield waitForProperty(this, property);
    return this.get(property);
  }),
  // this is a promise
  account: computed('_account', function() {
    return this.makePropertyPromise.perform('_account');
  }),
  // this contains a promise
  user: computed('_user', function() {
    return this.makePropertyPromise.perform('_user');
  }),
  // this contains a promise
  group: computed('_group', function() {
    return this.makePropertyPromise.perform('_group');
  }),
});
