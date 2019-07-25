import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject } from '@ember/service';
export default Component.extend({
	store: inject(),
	classNames: ["checkbox-list-selector"],
	selectedThemes: null,

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
		const { store, selectedThemes } = this;
		const themes = yield store.query('theme', {}); // Query to make sure you get all themes from the API instead
		this.checkSelectedThemes(selectedThemes, themes);
		this.set('themes', themes.sortBy('label'));
	}),

	checkSelectedThemes(selectedThemes, themes) {
		if (selectedThemes && selectedThemes.length > 0) {
			selectedThemes.map((selectedTheme) => {
				const foundTheme = themes.find((theme) => theme.get('label') == selectedTheme.get('label'));
				foundTheme.set('selected', true);
			})
		}
	}
});
