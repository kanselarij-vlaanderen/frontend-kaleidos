import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ThemesSelector extends Component {
  @service store;

  @tracked selectedThemes = this.args.selectedThemes;
  @tracked themes = this.fetchThemes();

  async fetchThemes() {
    const fetchedThemes = await this.store.query('theme', {}); // Query to make sure you get all themes from the API instead
    this.themes = fetchedThemes.sortBy('label').filter((item) => !item.deprecated);

    this.checkSelectedThemes(this.selectedThemes, fetchedThemes)
  }

  @action
  selectModel(theme) {
    if (!theme.get('selected')) {
      this.selectedThemes.addObject(theme);
    } else {
      this.selectedThemes.removeObject(theme);
    }
  }

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
}
