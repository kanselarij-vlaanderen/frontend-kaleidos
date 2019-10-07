import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';

export default Component.extend({
  user: alias('row'),
  store: inject(),
  isDeleting: false,
  actions: {
    async deleteAccount() {
      if (this.isDeleting) return;
      this.isDeleting = true;
      let foundUser = await this.store.findRecord('user', this.get('user.id'), { reload: true});
      await foundUser.destroyRecord();
      this.get('table').removeRow(foundUser);
      this.isDeleting = false;
    },
  }
});
