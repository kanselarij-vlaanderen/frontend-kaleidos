import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';

export default Component.extend({
  group: alias('value'),
  user: alias('row'),
  store: inject(),

  actions: {
    async chooseAccountGroup(newGroup) {
      let foundUser = await this.store.findRecord('user', this.get('user.id'));
      foundUser.set('group', newGroup);
      foundUser.save();
    },
  }
});
