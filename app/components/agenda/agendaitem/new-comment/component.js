import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  actions : {
    async createComment() {
      const { agenda, text } = this;

      let comment = this.store.createRecord('comment', { agenda });
      //await statement.save();
    },
  }
});
