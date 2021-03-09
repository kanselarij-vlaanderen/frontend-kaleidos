import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default Component.extend({
  group: alias('value'),
  @tracked user: alias('row'),
  store: inject(),

  actions: {
    async chooseAccountGroup(newGroup) {
      this.user.set('group', newGroup);
      await this.user.save();
    },
  },
});
