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

  async model() {
    const results = await this.store.query('mandatee', {
      'filter[government-body][:uri:]': CURRENT_GOVERNMENT_BODY,
      'filter[mandate][role][:id:]': this.visibleRoles.map((role) => role.id).join(','),
      include: 'person,mandate.role',
      sort: 'priority',
    });
    // Many versions of a mandatee exist within a government-body.
    // We only want the mandatees with no end-date or an end-date in the future.
    // mu-cl-resources doesn't have :has-no:-capability for properties.
    return results.filter((mandatee) => {
      if (mandatee.end) {
        return mandatee.end && mandatee.end < new Date();
      }
    });

  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
