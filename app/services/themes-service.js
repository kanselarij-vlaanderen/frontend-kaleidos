import Service, { inject as service } from '@ember/service';
import { set } from '@ember/object';

export default class ThemesService extends Service {
  @service store;

  themes = null;

  constructor() {
    super(...arguments);

    this.fetchAllThemes();
  }

  /**
   * Fetches all themes available and stores them in this service
   */
  async fetchAllThemes() {
    const themes = await this.store.query('theme', {});
    set(this, 'themes', themes);
  }
}
