import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

const VISIBLE_ROLES = [
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03de', // Minister-president
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03e0' // Minister
];

export default class MandateeSelector extends Component {
  @service store;
  @tracked mandateeOptions = [];
  @tracked filter = '';
  @tracked governmentBodyOfDate;


  defaultQueryOptions = {
    include: 'person,mandate.role',
    sort: 'priority',
  };

  constructor() {
    super(...arguments);
    this.governmentBodyOfDate = this.args.governmentBodyOfDate || new Date();
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
    queryOptions['filter[:gte:start]'] = this.governmentBodyOfDate.toISOString();
    queryOptions['filter[:lte:end]'] = this.governmentBodyOfDate.toISOString();

    let results = yield this.store.query('mandatee', queryOptions);

    if (results.length === 0) {
      results = yield this.loadCurrentBodyMandatees(searchTerm);
    }
    return results;
  }

  @task
  *loadVisibleRoles() {
    const visibleRoles = yield Promise.all(VISIBLE_ROLES.map((role) => this.store.findRecordByUri('role', role)));
    this.defaultQueryOptions['filter[mandate][role][:id:]'] = visibleRoles.map((role) => role.id).join(',');
    console.log("visibile roles")
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

  async loadCurrentBodyMandatees(searchTerm) {
    const queryOptions = {
      ...this.defaultQueryOptions,  // clone
    };
    if (searchTerm) {
      queryOptions['filter[person][last-name]'] = searchTerm;
    }
    queryOptions['filter[:has-no:end]'] = true;

    return  await this.store.query('mandatee', queryOptions);
  }
}
