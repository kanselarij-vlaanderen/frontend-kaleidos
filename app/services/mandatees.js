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
  };
}

export default class MandateesService extends Service {
  @service store;

  constructor() {
    super(...arguments);
    this.loadVisibleRoles.perform();
  }

  @task
  *loadVisibleRoles() {
    const visibleRoles = yield Promise.all(VISIBLE_ROLES.map((role) => this.store.findRecordByUri('role', role)));
    this.visibleRoles = visibleRoles;
  }

  @task
  *getMandateesActiveOn(referenceDateFrom=new Date(), referenceDateTo, searchText) {
    if (!referenceDateTo) {
      referenceDateTo = referenceDateFrom;
    }
    // Since this data is static, a local memoization/caching mechanism can be added
    // here in case of performance issues
    const activeMandateesInRange = [];
    const governmentBodies = yield this.fetchGovernmentBodies.perform(referenceDateFrom, referenceDateTo);
    for (const governmentBody of governmentBodies) {
      const mandatees = yield this.fetchMandateesForGovernmentBody.perform(governmentBody, referenceDateFrom, referenceDateTo, searchText);
      activeMandateesInRange.addObjects(mandatees);
    }

    return activeMandateesInRange;
  }

  @task
  *fetchGovernmentBodies(referenceDateFrom, referenceDateTo) {
    const governmentBodies = [];
    const closedInRange = this.store.query('government-body', {
      'filter[is-timespecialization-of][:has:is-timespecialization-of]': 'yes',
      'filter[generation][:lt:time]': referenceDateTo.toISOString(),
      'filter[invalidation][:gte:time]': referenceDateFrom.toISOString(),
    });
    const activeRange = this.store.queryOne('government-body', {
      'filter[is-timespecialization-of][:has:is-timespecialization-of]': 'yes',
      'filter[generation][:lt:time]': referenceDateTo.toISOString(),
      'filter[:has-no:invalidation]': 'yes'
    });

    const [closedBodies, activeBody] = yield Promise.all([closedInRange, activeRange]);
    governmentBodies.addObjects(closedBodies);
    if (activeBody) {
      governmentBodies.addObject(activeBody);
    }

    return governmentBodies;
  }

  @task
  *fetchMandateesForGovernmentBody(governmentBody, referenceDateFrom, referenceDateTo, searchText) {
    yield this.loadVisibleRoles.last; // Make sure visible roles are loaded
    // If no referenceDate is specified, all mandatees within the given governmentBody.
    // Can be multiple versions (see documentation on https://themis-test.vlaanderen.be/docs/catalogs#ministers ,
    // 2.2.4 mandatarissen)
    const queryOptions = {
      'filter[government-body][:uri:]': governmentBody.uri,
      include: 'person,mandate.role',
      'filter[mandate][role][:id:]': this.visibleRoles.map((role) => role.id).join(','),
      'page[size]': PAGE_SIZE.MANDATEES_IN_GOV_BODY
    };
    if (searchText) {
      queryOptions['filter[person][last-name]'] = searchText;
    }
    if (referenceDateTo) {
      // Many versions of a mandatee exist within a government-body.
      // We only want those versions with a start-end range that covers the given referenceDate
      queryOptions['filter[:lt:start]'] = referenceDateTo.toISOString();
      // No queryOptions[':lt:end'] = referenceDate; here
      // "end" is optional in data.
      // mu-cl-resources doesn't have :has-no:-capability for simple properties (which end-date is)
      // That's why we do some filtering client-side (see below)
    }
    let mandatees = yield this.store.query('mandatee', queryOptions);
    // We need to filter out the mandatees that are in the body
    // but have an end date before the range starts or active mandatees (i.e. no end date)
    if (referenceDateFrom) {
      mandatees = mandatees.filter((mandatee) => {
        if (mandatee.end) {
          return mandatee.end >= referenceDateFrom;
        } else {
          return true; // currently active mandatees
        }
      });
    }
    mandatees = mandatees.sortBy('priority').toArray(); // TODO: sorting on both "start" and "priority" yields incomplete results. Thus part of the sort in frontend
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
}
