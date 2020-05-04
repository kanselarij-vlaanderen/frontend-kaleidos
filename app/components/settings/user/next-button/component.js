import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  router: inject(),
  actions: {
    async onRowClick() {
      const account = await this.get('row.account');
      const user = await account.get('user');
      const userId = await user.get('id');
      this.router.transitionTo('settings.users.user', userId);
    },
  }
});
