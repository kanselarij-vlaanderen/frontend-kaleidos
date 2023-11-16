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
 * @argument excludeMandatees
 * @argument {Date} referenceDate: Date to get active Mandatees for
 */
export default class MandateeChecklist extends Component {
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
    if (this.args.openSearch) {
      this.mandateeOptions = [];
    } else {
      this.mandateeOptions = yield this.mandatees.getMandateesActiveOn.perform(
        this.referenceDate
      );
      this.mandateeOptions = this.mandateeOptions.filter(
        (mandatee) => !this.args.excludeMandatees?.includes(mandatee)
      );
    }
  }

  @restartableTask
  *filterMandatees(searchTerm) {
    yield timeout(100);
    return this.mandateeOptions.filter((mandatee) => {
      const lastName = mandatee.belongsTo('person').value().lastName;
      return lastName.toLowerCase().startsWith(searchTerm.toLowerCase());
    });
  }

  @action
  resetMandateeOptionsIfEmpty(param) {
    if (isEmpty(param)) {
      this.mandateeOptions = this.loadMandatees.perform();
    }
  }

  @restartableTask
  *searchMandatee(searchTerm) {
    yield timeout(300);
    this.mandateeOptions = yield this.mandatees.fetchMandateesByName.perform(
      searchTerm,
      this.referenceDate
    );
    this.mandateeOptions = this.mandateeOptions.filter(
      (mandatee) => !this.args.excludeMandatees?.includes(mandatee)
    );
  }
}
