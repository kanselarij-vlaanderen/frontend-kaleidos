import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { CURRENT_GOVERNMENT_BODY } from 'frontend-kaleidos/config/config';

const VISIBLE_ROLES = [
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03de', // Minister-president
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03e0' // Minister
];

export default class SettingsMinistersRoute extends Route {
  async beforeModel() {
    this.visibleRoles = await Promise.all(VISIBLE_ROLES.map((role) => this.store.findRecordByUri('role', role)));
  }

  model() {
    return this.store.query('mandatee', {
      'filter[government-body][:uri:]': CURRENT_GOVERNMENT_BODY,
      'filter[mandate][role][:id:]': this.visibleRoles.map((role) => role.id).join(','),
      include: 'person,mandate.role',
      sort: 'priority',
    });
  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
