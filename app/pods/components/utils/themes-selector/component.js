import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ThemesSelector extends Component {
  @service store;
  selectedThemes = null;

  constructor() {
    super(...arguments);
    this.findAll.perform();
    if (!this.selectedThemes) {
      this.set('selectedThemes', [])
    }
  }

  // This will load all the themes from the API
  @task(function* () {
    const themes = yield this.store.query('theme', {}); // Query to make sure you get all themes from the API instead
    this.set('themes', themes.sortBy('label').filter((item) => !item.deprecated));
    this.checkSelectedThemes(this.selectedThemes, this.themes);
  }) findAll;

  /**
   * Synchronises the selected themes from the checkboxes with the underlying models
   * @param  {Array}  selectedThemes    The themes currently selected in the checkboxes
   * @param  {Array}  themes            The themes in the data store
   */
  checkSelectedThemes(selectedThemes, themes) {
    if (selectedThemes && selectedThemes.length > 0) {
      selectedThemes.forEach((selectedTheme) => {
        const foundTheme = themes.find((theme) => theme.get('label') === selectedTheme.get('label'));
        if (foundTheme) {
          foundTheme.set('selected', true);
        }
      });
    }
  }

  @action
  selectModel(theme) {
    if (!theme.get('selected')) {
      this.selectedThemes.addObject(theme);
    } else {
      this.selectedThemes.removeObject(theme);
    }

    this.checkSelectedThemes(this.selectedThemes, this.themes);
  }
}
