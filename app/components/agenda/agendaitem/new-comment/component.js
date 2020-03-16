import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  classNames: ['vlc-panel-layout__main-content'],
  store: inject(),
  actions: {
    async createComment() {
      const { agenda } = this;
      await this.store.createRecord('comment', { agenda });
    },
  }
});
