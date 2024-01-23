import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const DEFAULT_VISIBLE_ROLES = [
  CONSTANTS.MANDATE_ROLES.MINISTER_PRESIDENT,
  CONSTANTS.MANDATE_ROLES.MINISTER,
  CONSTANTS.MANDATE_ROLES.VOORZITTER,
  CONSTANTS.MANDATE_ROLES.GEMEENSCHAPSMINISTER,
];

// Generates a sorting function (argument for Array.prototype.sort) for sorting
// by absolute distance to a referenceDate
function sortByDeltaToRef(referenceDate) {
  return function (a, b) {
    return Math.abs(referenceDate - a) - Math.abs(referenceDate - b);
  };
}

export default class MandateesService extends Service {
  @service conceptStore;
  @service store;

  roles = null;

  constructor() {
    super(...arguments);
    this.loadRoles.perform();
  }

  loadRoles = task(async () => {
    this.roles = await this.store.findAll('role');
  });

  getMandateesActiveOn = task(
    async (
      referenceDateFrom = new Date(),
      referenceDateTo,
      searchText,
      visibleRoleUris = DEFAULT_VISIBLE_ROLES
    ) => {
      const visibleRoles = await Promise.all(
        visibleRoleUris.map((role) => this.store.findRecordByUri('role', role))
      );
      if (!referenceDateTo) {
        referenceDateTo = referenceDateFrom;
      }
      // Since this data is static, a local memoization/caching mechanism can be added
      // here in case of performance issues
      const activeMandateesInRange = [];
      const governmentBodies = await this.fetchGovernmentBodies.perform(
        referenceDateFrom,
        referenceDateTo
      );
      for (const governmentBody of governmentBodies) {
        const mandatees = await this.fetchMandateesForGovernmentBody.perform(
          governmentBody,
          referenceDateFrom,
          referenceDateTo,
          searchText,
          visibleRoles
        );
        activeMandateesInRange.addObjects(mandatees);
      }

      return activeMandateesInRange;
    }
  );

  @task
  *fetchGovernmentBodies(referenceDateFrom, referenceDateTo) {
    const governmentBodies = [];
    const closedInRange = this.store.queryAll('government-body', {
      'filter[is-timespecialization-of][:has:is-timespecialization-of]': 'yes',
      'filter[generation][:lt:time]': referenceDateTo.toISOString(),
      'filter[invalidation][:gte:time]': referenceDateFrom.toISOString(),
    });
    const activeRange = this.store.queryOne('government-body', {
      'filter[is-timespecialization-of][:has:is-timespecialization-of]': 'yes',
      'filter[generation][:lt:time]': referenceDateTo.toISOString(),
      'filter[:has-no:invalidation]': 'yes',
    });

    const [closedBodies, activeBody] = yield Promise.all([
      closedInRange,
      activeRange,
    ]);
    governmentBodies.addObjects(closedBodies);
    if (activeBody) {
      governmentBodies.addObject(activeBody);
    }

    return governmentBodies;
  }

  @task
  *fetchMandateesForGovernmentBody(
    governmentBody,
    referenceDateFrom,
    referenceDateTo,
    searchText,
    visibleRoles
  ) {
    yield this.loadRoles.last; // Make sure visible roles are loaded
    // If no referenceDate is specified, all mandatees within the given governmentBody.
    // Can be multiple versions (see documentation on https://themis-test.vlaanderen.be/docs/catalogs#ministers ,
    // 2.2.4 mandatarissen)
    const queryOptions = {
      'filter[government-body][:uri:]': governmentBody.uri,
      include: 'person,mandate.role',
      'filter[mandate][role][:id:]': visibleRoles
        .map((role) => role.id)
        .join(','),
    };
    if (searchText) {
      queryOptions['filter[person][last-name]'] = searchText;
    }
    if (referenceDateTo) {
      // Many versions of a mandatee exist within a government-body.
      // We only want those versions with a start-end range that covers the given referenceDate
      queryOptions['filter[:lte:start]'] = referenceDateTo.toISOString();
      // No queryOptions[':lt:end'] = referenceDate; here
      // "end" is optional in data.
      // mu-cl-resources doesn't have :has-no:-capability for simple properties (which end-date is)
      // That's why we do some filtering client-side (see below)
    }
    let mandatees = yield this.store.queryAll('mandatee', queryOptions);
    // We need to filter out the mandatees that are in the body
    // but have an end date before the range starts or active mandatees (i.e. no end date)
    if (referenceDateFrom) {
      mandatees = mandatees.filter((mandatee) => {
        if (mandatee.end) {
          return mandatee.end > referenceDateFrom;
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
      'page[size]': 20,
    };
    const preOptions = {
      ...queryOptions,
      sort: '-start',
      'filter[:lt:start]': referenceDate.toISOString(),
    };
    const postOptions = {
      ...queryOptions,
      sort: 'start',
      'filter[:gte:start]': referenceDate.toISOString(),
    };
    const requests = [
      this.store.query('mandatee', preOptions),
      this.store.query('mandatee', postOptions),
    ];
    const [preMandatees, postMandatees] = yield Promise.all(requests);
    const mandatees = [...preMandatees.toArray(), ...postMandatees.toArray()];
    const sortedMandatees = mandatees.sort((a, b) =>
      sortByDeltaToRef(referenceDate)(a.start, b.start)
    );
    return sortedMandatees;
  }

  async getCurrentApplicationSecretary() {
    const [currentApplicationSecretary] =
      await this.getMandateesActiveOn.perform(
        new Date(),
        undefined,
        undefined,
        [CONSTANTS.MANDATE_ROLES.SECRETARIS]
      );

    return currentApplicationSecretary;
  }
}
