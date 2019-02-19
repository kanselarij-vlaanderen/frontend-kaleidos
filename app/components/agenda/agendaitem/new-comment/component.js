import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  actions : {
    async createComment() {
      const { agenda } = this;
      await this.store.createRecord('comment', { agenda });
    },
  }
});
