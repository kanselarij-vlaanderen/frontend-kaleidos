import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { addObject, removeObject } from 'frontend-kaleidos/utils/array-helpers';

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
  toggleTheme(theme, checked) {
    if (checked) {
      addObject(this.args.selectedThemes, theme);
    } else {
      removeObject(this.args.selectedThemes, theme);
    }
  }
}
