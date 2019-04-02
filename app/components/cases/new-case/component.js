import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  title: "",
  shortTitle: "",
  store: inject(),
  actions: {
    async createCase() {
      let cases = this.store.createRecord('case',
        {
          title: this.get('title'),
          shortTitle: this.get('shortTitle'),
          isArchived: false,
          type: this.get('type'),
          created: new Date(),
          policyLevel: this.get('selectedPolicyLevel')
        });
      await cases.save();
    },

    chooseTheme(theme) {
      this.set('selectedThemes', theme);
    },

    policyLevelChanged(policyLevel) {
      this.set('selectedPolicyLevel', policyLevel);
    },

    typeChanged(type) {
      this.set('type', type);
    },

    statusChange(status) {
      this.set('status', status);
    },

    close() {
      this.close();
    }
  }
});
