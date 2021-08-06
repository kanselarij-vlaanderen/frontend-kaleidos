// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  user: alias('row'),
  store: inject(),
  isDeleting: false,
  @tracked isVerifying: false,

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    async deleteAccount() {
      if (this.isDeleting) {
        return;
      }
      this.isDeleting = true;
      const foundUser = await this.store.findRecord('user', await this.get('user.id'), {
        reload: true,
      });
      const account = await foundUser.get('account');
      if (account) {
        await account.destroyRecord();
      }
      await foundUser.destroyRecord();
      this.isDeleting = false;
      this.isVerifying = false;
    },
    toggleIsVerifying() {
      this.toggleProperty('isVerifying');
    },
  },
});
