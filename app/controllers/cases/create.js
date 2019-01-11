import Controller from '@ember/controller';
import { A } from '@ember/array';
import { task, timeout } from 'ember-concurrency';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  themes: alias('model'),
  selectedThemes: A([]),
  actions: {
    async createDossier(event) {
      event.preventDefault();
      const { title, shortTitle, remark, themes } = this;
      let cases = this.store.createRecord('case', {  title, shortTitle, remark, themes });
      await cases.save();
      await this.transitionToRoute('cases');
    },
    async resetValue(param) {
      if (param === "") {
        this.set('themes', this.store.findAll('theme'));
      }
    },
    chooseTheme(theme) {
      this.set('selectedThemes', theme);
    },
  },
  searchTheme : task(function* (searchValue) {
    yield timeout(300);
    return this.store.query('theme', {
      filter: {
        naam: searchValue
      }
    });
  }),
});
