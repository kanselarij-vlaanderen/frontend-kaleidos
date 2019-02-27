import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	actions: {
    async createCase(event) {
      const { title, shortTitle, selectedType } = this;
      const date = new Date();
      let cases = this.store.createRecord('case', { title, shortTitle, created:date, type:selectedType }); //remark, themes: selectedThemes, type: selectedType, created: date, modified: date
      await cases.save();
    },
    async resetValue(param) {
      if (param === "") {
        this.set('contacts', this.store.findAll('capacity'));
      }
    },
    chooseTheme(theme) {
      this.set('selectedThemes', theme);
    },
    chooseType(type) {
      const typeModel = this.store.peekRecord('case-type', type);
      this.set('selectedType', typeModel);
    },
    chooseContact(capacity) {
      this.set('contact', capacity);
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
    nextStep() {
      this.set('part', 2);
    },
    previousStep() {
      this.set('part', 1);
    },
	}
	
});
