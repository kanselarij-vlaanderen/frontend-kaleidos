import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { addObject, removeObject } from 'frontend-kaleidos/utils/array-helpers';

/**
 * @param {Array<Theme>} selectedThemes The themes that are already selected
 */
export default class ThemesSelector extends Component {
  @service store;

  @tracked themes;

  constructor() {
    super(...arguments);
    this.findAll.perform();
  }

  findAll = task(async () => {
    this.themes = await this.store.queryAll('theme', {
      filter: { deprecated: false },
      sort: 'label',
    });
  });

  @action
  toggleTheme(theme, checked) {
    const themes = this.args.selectedThemes?.slice();
    if (checked) {
      addObject(themes, theme);
    } else {
      removeObject(themes, theme);
    }
    this.args.onChangeThemes?.(themes);
  }
}
