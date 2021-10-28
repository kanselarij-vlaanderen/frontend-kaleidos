import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { task, restartableTask } from 'ember-concurrency-decorators';
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
    sort: 'priority',
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
    } else {
      queryOptions['filter[government-body][:uri:]'] = CURRENT_GOVERNMENT_BODY;
    }
    return yield this.store.query('mandatee', queryOptions);
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
