import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { CURRENT_GOVERNMENT_BODY } from 'frontend-kaleidos/config/config';

const VISIBLE_ROLES = [
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03de', // Minister-president
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03e0' // Minister
];

export default class SettingsMinistersRoute extends Route {
  @service store;

  async beforeModel() {
    this.visibleRoles = await Promise.all(VISIBLE_ROLES.map((role) => this.store.findRecordByUri('role', role)));
  }

  async model() {
    // Assumes that there are < default page-size active mandatees
    let results = await this.store.query('mandatee', {
      'filter[government-body][:uri:]': CURRENT_GOVERNMENT_BODY,
      'filter[mandate][role][:id:]': this.visibleRoles.map((role) => role.id).join(','),
      include: 'person,mandate.role',
      sort: '-start', // Assumes that all mandatee start's are updated when something changes. Otherwise some might fall off default page size
    });
    results = results.sortBy('priority'); // TODO: sorting on both "start" and "priority" yields incomplete results. Thus part of the sort in frontend
    // Many versions of a mandatee exist within a government-body.
    // We only want the mandatees with no end-date or an end-date in the future.
    // mu-cl-resources doesn't have :has-no:-capability for properties.
    return results.filter((mandatee) => {
      if (mandatee.end) {
        return new Date() < mandatee.end; // end is in the future
      } else {
        return true;
      }
    });

  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
