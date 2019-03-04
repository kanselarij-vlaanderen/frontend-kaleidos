import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  actions : {
    selectAvailableSubcase(subcase) {
      this.selectSubcase(subcase, "available");
    }
  },
  async didInsertElement() {
    this._super(...arguments);
    const subcases = await this.store.query('subcase', {
      filter: {
        ":has-no:agendaitems" : "yes"
      },
      include:['agendaitems']
    });
    this.set('subcases', subcases);
  },
});

