import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * @param {Array<Theme>} selectedThemes The themes that are already selected
 */
export default class ThemesSelector extends Component {
  @service store;

  constructor() {
    super(...arguments);
    this.findAll.perform();
  }

  @task
  *findAll() {
    this.themes = yield this.store.queryAll('theme', {
      filter: { deprecated: false },
      sort: 'label',
    });
  }

  @action
  toggleTheme(theme, wasChecked) {
    if (wasChecked) {
      this.args.selectedThemes.removeObject(theme);
    } else {
      this.args.selectedThemes.addObject(theme);
    }
  }
}
