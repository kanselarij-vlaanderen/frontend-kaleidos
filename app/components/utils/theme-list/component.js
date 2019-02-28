import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  selectedThemes:null,

  searchTheme: task(function* (searchValue) {
    yield timeout(300);
    return this.store.query('theme', {
      filter: {
        label: searchValue
      }
    });
  }),

  actions: {
    chooseTheme(themes) {
      this.set('selectedThemes', themes);
      this.chooseTheme(themes);
    },
    async resetValueIfEmpty(param) {
      if (param === "") {
        this.set('themes', this.store.findAll('theme'));
      }
    }
  },

  async didInsertElement() {
    this._super(...arguments);
    this.set('themes', this.store.findAll('theme'));
  }
});
