import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { observer } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  classNames: ["checkbox-list-selector"],
  selectedThemes: null,

  selectedThemesObserver: observer('selectedThemes', 'themes', function() {
    const { themes, selectedThemes } = this;
    if (themes && selectedThemes) {
      themes.map(theme => theme.set('selected', false));
      this.checkSelectedThemes(selectedThemes, themes);
    }
  }),

  actions: {
    selectModel(theme) {
      if (!theme.get('selected')) {
        this.selectedThemes.addObject(theme);
      } else {
        this.selectedThemes.removeObject(theme);
      }
    },
  },

	init() {
		this._super(...arguments);
		this.findAll.perform();
		if (!this.selectedThemes) {
			this.set('selectedThemes', [])
		}
	},

  findAll: task(function* () {
    const themes = yield this.store.query('theme', {}); // Query to make sure you get all themes from the API instead
    this.set('themes', themes.sortBy('label'));
  }),

  checkSelectedThemes(selectedThemes, themes) {
    if (selectedThemes && selectedThemes.length > 0) {
      selectedThemes.map((selectedTheme) => {
        const foundTheme = themes.find((theme) => theme.get('label') === selectedTheme.get('label'));
        foundTheme.set('selected', true);
      })
    }
  }
});
