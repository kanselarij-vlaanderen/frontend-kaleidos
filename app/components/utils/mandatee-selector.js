import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

const VISIBLE_ROLES = [
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03de', // Minister-president
  'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03e0', // Minister
  'http://themis.vlaanderen.be/id/bestuursfunctie/60d0dc2ab1838d01fca7db65', // Voorzitter
  'http://themis.vlaanderen.be/id/bestuursfunctie/60d0dc2ab1838d01fca7db67', // Gemeenschapsminister
];
/**
 * @argument singleSelect
 * @argument readOnly
 * @argument selectedMandatee
 * @argument chooseMandatee
 * @argument {Date} referenceDate: Date to get active Mandatees for
 */
export default class MandateeSelector extends Component {
  @service store;
  @tracked mandateeOptions = [];
  @tracked filter = '';
  @tracked referenceDate;

  defaultQueryOptions = {
    include: 'person,mandate.role',
    sort: 'priority',
  };

  constructor() {
    super(...arguments);
    this.referenceDate = this.args.referenceDate || new Date();
    this.initialLoad = this.loadVisibleRoles.perform();
    this.mandateeOptions = this.loadMandatees.perform();
  }

  @task
  *loadMandatees(searchTerm) {
    if (this.initialLoad.isRunning) {
      yield this.initialLoad;
    }
    let results = yield this.loadCurrentBodyMandatees(searchTerm);

    const currentBodyStartDate = results.firstObject.start;
    if (currentBodyStartDate > this.referenceDate) {
      results = yield this.loadPastBodyMandatees(searchTerm);
    }
    return results;
  }

  @task
  *loadVisibleRoles() {
    const visibleRoles = yield Promise.all(
      VISIBLE_ROLES.map((role) => this.store.findRecordByUri('role', role))
    );
    this.defaultQueryOptions['filter[mandate][role][:id:]'] = visibleRoles
      .map((role) => role.id)
      .join(',');
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
      ...this.defaultQueryOptions, // clone
    };
    if (searchTerm) {
      queryOptions['filter[person][last-name]'] = searchTerm;
    }
    /* WARNING: use of the :has-no:  filter is officially only documented for use with relations, not properties.
    However, at the time of writing, this method works in the case of xsd:datetime as well.
    If this test case should ever fail, the loadCurrentBodyMandatees method can be adjusted
    to fetch the mandatee with the most recent start date,
    and then use that start date to get the current government body.
    This is less efficient than the current method, but would require no hard-coding and does not rely on :has-no: */
    queryOptions['filter[:has-no:end]'] = true;

    return await this.store.query('mandatee', queryOptions);
  }

  async loadPastBodyMandatees(searchTerm) {
    const queryOptions = {
      ...this.defaultQueryOptions, // clone
    };
    if (searchTerm) {
      queryOptions['filter[person][last-name]'] = searchTerm;
    }
    queryOptions['filter[:lte:start]'] = this.referenceDate.toISOString();
    queryOptions['filter[:gte:end]'] = this.referenceDate.toISOString();

    return await this.store.query('mandatee', queryOptions);
  }
}
