import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import moment from 'moment';
import { inject as service } from '@ember/service';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class MandateeSelector extends Component {
  @service store;
  @tracked mandatees = [];
  @tracked filter = '';

  constructor() {
    super(...arguments);
    this.mandatees = this.loadMandatees.perform('');
  }

  @task
  *loadMandatees(searchTerm) {
    const query = {};
    if (searchTerm) {
      query['filter[person][last-name]'] = searchTerm;
    } else {
      query['filter[:gte:end]'] = moment().utc().toDate().toISOString();
    }
    return yield this.store.query('mandatee', {
      ...query,
      'page[size]': PAGE_SIZE.SELECT,
      sort: 'priority',
      include: 'person',
    });
  }

  @task
  *searchTask(searchTerm) {
    yield timeout(300);
    return this.loadMandatees.perform(searchTerm);
  }

  @action
  resetValueIfEmpty(param) {
    if (param === '') {
      this.loadMandatees.perform('');
    }
  }
}
