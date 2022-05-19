import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { timeout, task, restartableTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { CURRENT_GOVERNMENT_BODY } from 'frontend-kaleidos/config/config';

const VISIBLE_ROLES = [
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03de', // Minister-president
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03e0' // Minister
];

export default class MandateeSelector extends Component {
  @service store;
  @tracked mandateeOptions = [];
  @tracked filter = '';

  defaultQueryOptions = {
    include: 'person,mandate.role',
    sort: '-start', // Assumes that all mandatee start's are updated when something changes. Otherwise some might fall off default page size
  };

  constructor() {
    super(...arguments);
    this.initialLoad = this.loadVisibleRoles.perform();
    this.mandateeOptions = this.loadMandatees.perform();
  }

  @task
  *loadMandatees(searchTerm) {
    if (this.initialLoad.isRunning) {
      yield this.initialLoad;
    }
    const queryOptions = {
      ...this.defaultQueryOptions,  // clone
    };
    if (searchTerm) {
      queryOptions['filter[person][last-name]'] = searchTerm;
    }
    queryOptions['filter[government-body][:uri:]'] = CURRENT_GOVERNMENT_BODY;

    // Assumes that there are < default page-size active mandatees
    let results = yield this.store.query('mandatee', queryOptions);
    results = results.sortBy('priority'); // TODO: sorting on both "start" and "priority" yields incomplete results. Thus part of the sort in frontend
    // Many versions of a mandatee exist within a government-body.
    // We only want the mandatees with no end-date or an end-date in the future.
    // mu-cl-resources doesn't have :has-no:-capability for properties.
    return results.filter((mandatee) => {
      if (mandatee.end) {
        return new Date() < mandatee.end;  // end is in the future
      } else {
        return true;
      }
    });
  }

  @task
  *loadVisibleRoles() {
    const visibleRoles = yield Promise.all(VISIBLE_ROLES.map((role) => this.store.findRecordByUri('role', role)));
    this.defaultQueryOptions['filter[mandate][role][:id:]'] = visibleRoles.map((role) => role.id).join(',');
  }

  @restartableTask
  *searchTask(searchTerm) {
    yield timeout(300);
    return this.loadMandatees.perform(searchTerm);
  }

  @action
  resetMandateeOptionsIfEmpty(param) {
    if (isEmpty(param)) {
      this.mandateeOptions = this.loadMandatees.perform();
    }
  }
}
