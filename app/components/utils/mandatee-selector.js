import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import moment from 'moment';
import { inject as service } from '@ember/service';

export default class MandateeSelector extends Component {
  @tracked selectedMandatees = null;
  @tracked mandatees;
  @service store;

  sortField = 'priority';
  searchField = 'title';
  includeField = 'person';

  constructor() {
    super(...arguments);
    this.loadMandatees.perform();
  }

  get filter() {
    return {
      ':gte:end': moment()
        .utc()
        .toDate()
        .toISOString(),
    };
  }

  queryOptions() {
    const options = {};
    if (this.sortField) {
      options.sort = this.sortField;
    }
    if (this.filter) {
      options.filter = this.filter;
    }
    if (this.includeField) {
      options.include = this.includeField;
    }
    return options;
  }

  @task(function *() {
    this.mandatees = yield this.store.query('mandatee', this.queryOptions());
  })loadMandatees;


  @task(function *(searchValue) {
    yield timeout(300);
    if (this.queryOptions().filter) {
      this.queryOptions().filter[this.searchField] = searchValue;
    } else {
      const filter = {};
      filter[this.searchField] = searchValue;
      this.queryOptions().filter = filter;
    }
    return this.store.query('mandatee', this.queryOptions());
  })searchTask;

  @action
  chooseMandatee(mandatees) {
    this.selectedMandatees = mandatees;
  }

  @action
  resetValueIfEmpty(param) {
    if (param === '') {
      this.queryOptions =
        {
          sort: this.sortField,
        };
      this.loadMandatees.perform();
    }
  }
}
