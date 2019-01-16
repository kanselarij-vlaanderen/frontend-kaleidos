import Component from '@ember/component';

import { A } from '@ember/array';
import { task, timeout } from 'ember-concurrency';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  themes: alias('model'),
  selectedThemes: A([]),
  types: A(["mr","overlegcomite", "ministrieel", "persbericht"]),
  actions: {
    async createDossier(event) {
      event.preventDefault();
      const { title, shortTitle, remark, selectedThemes, selectedType } = this;
      let cases = this.store.createRecord('case', {  title, shortTitle, remark, themes: selectedThemes, type: selectedType });
      await cases.save();
      await this.transitionToRoute('cases');
    },
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
    async step(){
      return await this.step();
    }
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
