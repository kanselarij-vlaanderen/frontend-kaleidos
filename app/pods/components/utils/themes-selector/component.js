import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ThemesSelector extends Component {
  @service store;

  @tracked selectedThemes = this.args.selectedThemes;
  @tracked foundTheme = null;

  themes = null;

  constructor() {
    super(...arguments);

    this.fetchThemes();
  }

  async fetchThemes() {
    const fetchedThemes = await this.store.query('theme', {}); // Query to make sure you get all themes from the API instead
    set(this, 'themes', fetchedThemes.sortBy('label').filter((item) => !item.deprecated));

    console.log('%cSELECTED THEMES IN THEMESELECTOR', 'background-color: #c43b64; padding: 5px; border-radius: 3px; font-weight: bold; color: white', this.selectedThemes);
    // this.checkSelectedThemes(this.selectedThemes, fetchedThemes)
  }

  @action
  selectModel(theme) {
    if (!theme.get('selected')) {
      this.selectedThemes.addObject(theme);
    } else {
      this.selectedThemes.removeObject(theme);
    }
  }

  @action
  checkSelectedThemes(theme) {
    console.log('%ccheckSelectedThemes', 'background-color: #e9b329; padding: 5px; border-radius: 3px; font-weight: bold; color: white');
    if (this.selectedThemes && this.selectedThemes.length > 0) {
      this.selectedThemes.forEach((selectedTheme) => {
        console.log('%cDEBUG', 'background-color: #1962dd; padding: 5px; border-radius: 3px; font-weight: bold; color: white', theme.get('label'), selectedTheme.get('label'));
        return theme.get('label') === selectedTheme.get('label');
      });
    }

    return false;
  }
}
