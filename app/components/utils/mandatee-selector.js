import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import moment from 'moment';
import { inject as service } from '@ember/service';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class MandateeSelector extends Component {
  @service store;
  @tracked mandateeOptions = [];
  @tracked filter = '';

  constructor() {
    super(...arguments);
    this.mandateeOptions = this.loadMandatees.perform();
  }

  @task
  *loadMandatees(searchTerm) {
    const query = {};
    if (searchTerm) {
      // There is no time/government-filter here. This implies that once users
      // start searching, they can find (and assign) any mandatee, also those of previous governments
      query['filter[person][last-name]'] = searchTerm;
    } else {
      // TODO: switch to filtering on related government (the current one) once Themis-integration is merged.
      // In Themis active mandatees don't have an end-date.
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
  resetMandateeOptionsIfEmpty(param) {
    if (isEmpty(param)) {
      this.mandateeOptions = this.loadMandatees.perform();
    }
  }
}
