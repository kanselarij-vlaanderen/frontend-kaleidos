import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ThemesSelector extends Component {
  @service store;
  @tracked themeLabels; // A key value pair with keys label and selected.
  @tracked selectedThemes = this.args.selectedThemes || []; // The themes from newsletterinfo. This can be undefined or null so we default to an empty list

  constructor() {
    super(...arguments);
    this.findAll.perform();
  }

  // This will load all the themes from the API once invoked
  @task(function *() {
    const themes = yield this.store.query('theme', {}); // Query to make sure you get all themes from the API instead
    this.themes = themes.sortBy('label').filter((theme) => !theme.deprecated);
    this.themeLabels = this.themes.map((theme) => ({
      label: theme.label,
      selected: false,
    }));
  }) findAll;

  checkSelectedLabels() {
    if (this.selectedThemes && this.selectedThemes.length > 0) {
      this.selectedThemes.forEach((selectedTheme) => {
        const foundTheme = this.themeLabels.find((theme) => theme.label === selectedTheme.get('label'));
        if (foundTheme) {
          foundTheme.selected = true;
        }
      });
    }
  }

  get selectedThemesReload() {
    if (this.args.selectedThemes && this.args.selectedThemes.length > 0) {
      this.selectedThemes = this.args.selectedThemes;
      this.themeLabels = this.themes.map((theme) => ({
        label: theme.label,
        selected: false,
      }));
      this.checkSelectedLabels();
    }
    return this.themeLabels;
  }

  @action
  selectModel(themeLabel) {
    if (!themeLabel.selected) {
      this.selectedThemes.addObject(this.themes.find((theme) => theme.label === themeLabel.label));
    } else {
      this.selectedThemes.removeObject(this.themes.find((theme) => theme.label === themeLabel.label));
    }
  }
}
