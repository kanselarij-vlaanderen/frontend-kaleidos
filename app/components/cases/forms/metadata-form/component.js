import Component from '@ember/component';
import { A } from '@ember/array';
import { task, timeout } from 'ember-concurrency';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  themes: null,
  selectedThemes: A([]),
  
  actions: {
    async resetValue(param) {
      if (param === "") {
        this.set('themes', this.store.findAll('theme'));
      }
    },
    async chooseTheme(theme) {
      return await this.chooseTheme(theme);
    },
    async shortTitleChange(event) {
      return await this.shortTitleChange(event.target.value);
    },
    async titleChange(longTitle) {
      return await this.titleChange(longTitle);
    },
    async statusChange(status) {
      return await this.statusChange(status);
    },
    async chooseType(type) {
      return await this.chooseType(type);
    },
    async step() {
      return await this.step();
    }
  },
  searchTheme: task(function* (searchValue) {
    yield timeout(300);
    return this.store.query('theme', {
      filter: {
        naam: searchValue
      }
    });
  }),
  getThemes() {
    this.set('themes', this.store.findAll('theme'));
  },
  didInsertElement: async function () {
    this._super(...arguments);
    return await this.getThemes();
  },
});
