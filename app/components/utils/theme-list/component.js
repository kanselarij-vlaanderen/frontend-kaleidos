import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
export default Component.extend({
  store: inject(),
  selectedThemes: null,

  sortedThemes: computed('themes', function () {
    return this.get('themes');
  }),

  searchTheme: task(function* (searchValue) {
    yield timeout(300);
    return this.store.query('theme', {
      filter: {
        label: searchValue
      },
      sort: 'label'
    });
  }),

  actions: {
    chooseTheme(themes) {
      this.set('selectedThemes', themes);
      this.chooseTheme(themes);
    },
    async resetValueIfEmpty(param) {
      if (param === "") {
        this.set('themes', this.store.query('theme', { sort: 'label' }));
      }
    }
  },

  async didInsertElement() {
    this._super(...arguments);
    this.set('themes', this.store.query('theme', { sort: 'label' }));
  }
});
