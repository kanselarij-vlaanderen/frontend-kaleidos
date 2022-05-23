import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
// import CONSTANTS from 'frontend-kaleidos/config/constants';
// import {  } from 'frontend-kaleidos/config/config';

const VISIBLE_ROLES = [
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03de', // Minister-president
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03e0', // Minister
  'http://themis.vlaanderen.be/id/bestuursfunctie/60d0dc2ab1838d01fca7db65', // Voorzitter
  'http://themis.vlaanderen.be/id/bestuursfunctie/60d0dc2ab1838d01fca7db67', // Gemeenschapsminister
];

export default class MandateesService extends Service {
  @service store;

  constructor() {
    super(...arguments);
    this.loadVisibleRoles.perform();
  }

  @task
  *getMandateesActiveOn(referenceDate=new Date()) {
    // Since this data is static, a local memoization/caching mechanism can be added
    // here in case of performance issues
    const governmentBody = yield this.fetchGovernmentBody.perform(referenceDate);
    if (governmentBody) {
      const mandatees = yield this.fetchMandateesForGovernmentBody.perform(governmentBody, referenceDate);
      return mandatees;
    }
  }

  @task
  *fetchGovernmentBody(referenceDate) {
    const closedRange = this.store.queryOne('government-body', {
      'filter[is-timespecialization-of][:has:is-timespecialization-of]': 'yes',
      'filter[start][:lte:time]': referenceDate.toISOString(),
      'filter[end][:gt:time]': referenceDate.toISOString()
    });
    const openRange = this.store.queryOne('government-body', {
      'filter[is-timespecialization-of][:has:is-timespecialization-of]': 'yes',
      'filter[start][:lte:time]': referenceDate.toISOString(),
      'filter[:has-no:end]': 'yes'
    });
    const [closedBody, openBody] = (yield Promise.all([closedRange, openRange]))
    const existingBody = closedBody || openBody;
    if (existingBody) {
      if (closedBody && openBody) {
        console.warn('Multiple active government bodies for given referenceDate. Probably something wrong in data');
      }
      return existingBody;
    }
    return null;
  }

  @task
  *fetchMandateesForGovernmentBody(governmentBody, referenceDate=null) {
    // If no referenceDate is specified, all mandatees withi
    const queryOptions = {
      'filter[government-body][:uri:]': governmentBody.uri,
      include: 'person,mandate.role',
      'filter[mandate][role][:id:]': this.visibleRoles.map((role) => role.id).join(','),
      'page[size]': 100
    }
    if (referenceDate) {
      // Many versions of a mandatee exist within a government-body.
      // We only want those versions with a start-end range that covers the given referenceDate
      queryOptions['filter[:lte:start]'] = referenceDate.toISOString();
      // No queryOptions[':lt:end'] = referenceDate; here
      // "end" is optional in data.
      // mu-cl-resources doesn't have :has-no:-capability for simple properties (which end-date is)
      // That's why we do some filtering client-side (see below)
    }
    let mandatees = yield this.store.query('mandatee', queryOptions);
    mandatees = mandatees.sortBy('priority').toArray(); // TODO: sorting on both "start" and "priority" yields incomplete results. Thus part of the sort in frontend
    if (referenceDate) {
      mandatees = mandatees.filter((mandatee) => {
        if (mandatee.end) {
          return referenceDate < mandatee.end;
        } else {
          return true;
        }
      });
    }
    return mandatees;
  }

  @task
  *loadVisibleRoles() {
    const visibleRoles = yield Promise.all(VISIBLE_ROLES.map((role) => this.store.findRecordByUri('role', role)));
    this.visibleRoles = visibleRoles
    // this.defaultQueryOptions['filter[mandate][role][:id:]'] = visibleRoles.map((role) => role.id).join(',');
  }
}
