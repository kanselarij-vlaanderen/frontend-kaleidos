import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Controller.extend({
  contacts: alias('model'),
  part: 1,
  isPartOne : computed('part', function() {
    return this.get('part') === 1;
  }),
  actions: {
    async createCase(event) {
      event.preventDefault();
      const { title, shortTitle, remark, selectedThemes, selectedType, contact } = this;
      const date = new Date();
      let cases = this.store.createRecord('case', { title, shortTitle, remark, themes: selectedThemes, type: selectedType, created: date, modified: date, contact });
      await cases.save();
      await this.transitionToRoute('cases');
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
      this.set('selectedType', type);
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
  },
  searchContact : task(function* (searchValue) {
    yield timeout(300);
    return this.store.query('capacity', {
      filter: {
        label: searchValue
      }
    });
  }),
});
