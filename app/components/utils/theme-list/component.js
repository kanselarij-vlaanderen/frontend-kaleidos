import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  store: inject(),

  searchTheme: task(function* (searchValue) {
    yield timeout(300);
    return this.store.query('theme', {
      filter: {
        naam: searchValue
      }
    });
  }),
  themes: computed("store", function(){
    return this.store.findAll('theme');
  }),

  actions: {
    async chooseTheme(themes) {
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
