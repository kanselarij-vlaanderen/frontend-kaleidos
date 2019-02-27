import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  actions: {
    async createCase() {
      const { title, shortTitle, type } = this;
      const date = new Date();
      let cases = this.store.createRecord('case', 
      { 
        title, 
        shortTitle, 
        type,
        created: date, 
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

    titleChange(title) {
      this.set('title', title);
    },

    shortTitleChange(shortTitle) {
      this.set('shortTitle', shortTitle);
    },

    statusChange(status) {
      this.set('status', status);
    },

    close() {
      this.close();
    }
  }
});
