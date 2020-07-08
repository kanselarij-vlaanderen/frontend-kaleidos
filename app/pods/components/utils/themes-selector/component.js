import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ThemesSelector extends Component {
  @service store;
  @service themesService;

  @tracked foundTheme = null;

  constructor() {
    super(...arguments);

  }

  // These are effectively all available themes in the store
  @computed('themesService.themes.[]')
  get themes() {
    if (this.themesService.themes) {
      return this.themesService.themes;
    }

    return [];
  }

  // These are the checkboxes we will render (these are not models!)
  @computed('themes', 'args.selectedThemes')
  get checkBoxes() {
    const selectedThemesDict = {};

    this.args.selectedThemes.forEach((selectedTheme) => {
      selectedThemesDict[selectedTheme.label] = selectedTheme;
    });

    if (this.themes.length && selectedThemesDict) {
      return this.themes.map((theme) => {
        const selectedTheme = selectedThemesDict[theme.label];
        return {
          selected: selectedTheme !== undefined,
          label: theme.label,
        };
      });
    }

    return [];
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
  checkSelectedThemes() {
    //TODO loop over themes
    if (this.selectedThemes && this.selectedThemes.length > 0) {
      this.selectedThemes.forEach((selectedTheme) => {
        return this.themes.get('label') === selectedTheme.get('label');
      });
    }

    return false;
  }
}
