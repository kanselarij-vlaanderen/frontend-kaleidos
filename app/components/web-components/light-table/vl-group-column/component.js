import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';

export default Component.extend({
  group: alias('value'),
  user: alias('row'),
  store: inject(),


  actions: {
    async chooseAccountGroup(newGroup) {
      const user = this.get('user');
      user.set('group', newGroup);
      let foundUser = await this.store.findRecord('user', user.get('id'));
      foundUser.save()
    },
  }
});
