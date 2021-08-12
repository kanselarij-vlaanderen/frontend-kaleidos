import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { CURRENT_GOVERNMENT_BODY } from 'frontend-kaleidos/config/config';

export default class SettingsMinistersRoute extends Route {
  model() {
    return this.store.query('mandatee', {
      'filter[government-body][:uri:]': CURRENT_GOVERNMENT_BODY,
      sort: 'priority',
    });
  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
