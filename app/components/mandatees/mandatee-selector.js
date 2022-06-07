import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

/**
 * @argument multiple
 * @argument disabled
 * @argument selectedMandatee
 * @argument onSelectMandatee
 * @argument {Date} referenceDate: Date to get active Mandatees for
 */
export default class MandateeSelector extends Component {
  @service store;
  @service mandatees;

  @tracked mandateeOptions = [];
  @tracked referenceDate;

  constructor() {
    super(...arguments);
    this.referenceDate = this.args.referenceDate || new Date();
    this.loadMandatees.perform();
  }

  @task
  *loadMandatees() {
    this.mandateeOptions = yield this.mandatees.getMandateesActiveOn.perform(this.referenceDate);
  }

  @restartableTask
  *searchTask(searchTerm) {
    yield timeout(100);
    return this.filterMandatees(searchTerm);
  }

  @action
  resetMandateeOptionsIfEmpty(param) {
    if (isEmpty(param)) {
      this.mandateeOptions = this.loadMandatees.perform();
    }
  }

  filterMandatees(searchTerm) {
    return this.mandateeOptions.filter((mandatee) => {
      const lastName = mandatee.belongsTo('person').value().lastName;
      return lastName.toLowerCase().startsWith(searchTerm.toLowerCase());
    });
  }
}
