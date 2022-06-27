import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

const VISIBLE_ROLES = [
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03de', // Minister-president
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03e0', // Minister
  'http://themis.vlaanderen.be/id/bestuursfunctie/60d0dc2ab1838d01fca7db65', // Voorzitter
  'http://themis.vlaanderen.be/id/bestuursfunctie/60d0dc2ab1838d01fca7db67', // Gemeenschapsminister
];

// Generates a sorting function (argument for Array.prototype.sort) for sorting
// by absolute distance to a referenceDate
function sortByDeltaToRef(referenceDate) {
  return function(a, b) {
    return Math.abs(referenceDate - a) - Math.abs(referenceDate - b);
  }
}

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
      'filter[generation][:lte:time]': referenceDate.toISOString(),
      'filter[invalidation][:gt:time]': referenceDate.toISOString()
    });
    const openRange = this.store.queryOne('government-body', {
      'filter[is-timespecialization-of][:has:is-timespecialization-of]': 'yes',
      'filter[generation][:lte:time]': referenceDate.toISOString(),
      'filter[:has-no:invalidation]': 'yes'
    });
    const [closedBody, openBody] = yield Promise.all([closedRange, openRange]);
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
    yield this.loadVisibleRoles.last; // Make sure visible roles are loaded
    // If no referenceDate is specified, all mandatees within the given governmentBody.
    // Can be multiple versions (see documentation on https://themis-test.vlaanderen.be/docs/catalogs#ministers ,
    // 2.2.4 mandatarissen)
    const queryOptions = {
      'filter[government-body][:uri:]': governmentBody.uri,
      include: 'person,mandate.role',
      'filter[mandate][role][:id:]': this.visibleRoles.map((role) => role.id).join(','),
      'page[size]': PAGE_SIZE.MANDATEES_IN_GOV_BODY
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
  *fetchMandateesByName(nameSearchTerm, referenceDate) {
    const queryOptions = {
      'filter[person][last-name]': nameSearchTerm,
      'filter[:has:government-body]': 'yes',
      include: 'person,mandate.role',
      'page[size]': 20
    };
    const preOptions = {
      ...queryOptions,
      'sort': '-start',
      'filter[:lt:start]': referenceDate.toISOString()
    };
    const postOptions = {
      ...queryOptions,
      'sort': 'start',
      'filter[:gte:start]': referenceDate.toISOString()
    };
    const requests = [
      this.store.query('mandatee', preOptions),
      this.store.query('mandatee', postOptions)
    ];
    const [preMandatees, postMandatees] = yield Promise.all(requests);
    const mandatees = [...preMandatees.toArray(), ...postMandatees.toArray()];
    const sortedMandatees = mandatees.sort((a, b) => sortByDeltaToRef(referenceDate)(a.start, b.start));
    return sortedMandatees;
  }

  @task
  *loadVisibleRoles() {
    const visibleRoles = yield Promise.all(VISIBLE_ROLES.map((role) => this.store.findRecordByUri('role', role)));
    this.visibleRoles = visibleRoles;
  }

  @task
  *getMandateesActiveForRange(referenceDateFrom=new Date(), referenceDateTo=new Date(), searchText) {
    // Since this data is static, a local memoization/caching mechanism can be added
    // here in case of performance issues
    const activeMandateesInRange = [];
    const governmentBodies = yield this.fetchGovernmentBodiesForRange.perform(referenceDateFrom, referenceDateTo);
    if (governmentBodies.length) {
      for (const governmentBody of governmentBodies) {
        if (governmentBody) { // TODO KAS-3500 can be null
          const mandatees = yield this.fetchMandateesForGovernmentBodyRange.perform(governmentBody, referenceDateFrom, referenceDateTo, searchText);
          activeMandateesInRange.addObjects(mandatees);
        }
      }

    }
    return activeMandateesInRange;
  }

  @task
  *fetchGovernmentBodiesForRange(referenceDateFrom, referenceDateTo) {
    const governmentBodies = [];
    const startedInRange = this.store.query('government-body', {
      'filter[is-timespecialization-of][:has:is-timespecialization-of]': 'yes',
      'filter[generation][:lt:time]': referenceDateTo.toISOString(),
      'filter[invalidation][:gte:time]': referenceDateFrom.toISOString(),
    });
    const activeRange = this.store.queryOne('government-body', {
      'filter[is-timespecialization-of][:has:is-timespecialization-of]': 'yes',
      'filter[generation][:lt:time]': referenceDateTo.toISOString(),
      'filter[:has-no:invalidation]': 'yes'
    });

    const [startedBodies, activeBody] = yield Promise.all([startedInRange, activeRange]);
    governmentBodies.addObjects(startedBodies);
    governmentBodies.addObject(activeBody);
    if (governmentBodies.length) {
      return governmentBodies;
    }
    return null;
  }

  @task
  *fetchMandateesForGovernmentBodyRange(governmentBody, referenceDateFrom, referenceDateTo, searchText) {
    yield this.loadVisibleRoles.last; // Make sure visible roles are loaded
    // If no referenceDate is specified, all mandatees within the given governmentBody.
    // Can be multiple versions (see documentation on https://themis-test.vlaanderen.be/docs/catalogs#ministers ,
    // 2.2.4 mandatarissen)
    const queryOptions = {
      'filter[government-body][:uri:]': governmentBody.uri,
      include: 'person,mandate.role',
      'filter[mandate][role][:id:]': this.visibleRoles.map((role) => role.id).join(','),
      'page[size]': PAGE_SIZE.MANDATEES_IN_GOV_BODY
    }
    if (searchText) {
      queryOptions['filter[person][last-name]'] = searchText;
    }
    if (referenceDateFrom) {
      // Many versions of a mandatee exist within a government-body.
      // We only want those versions with a start-end range that covers the given referenceDate
      queryOptions['filter[:lt:start]'] = referenceDateTo.toISOString();
      // No queryOptions[':lt:end'] = referenceDate; here
      // "end" is optional in data.
      // mu-cl-resources doesn't have :has-no:-capability for simple properties (which end-date is)
      // That's why we do some filtering client-side (see below)
    }
    let mandatees = yield this.store.query('mandatee', queryOptions);
    // We need to filter out the mandatees that are in the body but have an end date before the range starts
    // or active mandatees who have no end date yet
    mandatees = mandatees.filter((mandatee) => {
      if (mandatee.end) {
        if (mandatee.end >= referenceDateFrom) {
          return true;
        }
        return false;
      } else {
        // currently active mandatees
        return true; 
      }
    });
    mandatees = mandatees.sortBy('priority').toArray(); // TODO: sorting on both "start" and "priority" yields incomplete results. Thus part of the sort in frontend
    return mandatees;
  }
}
