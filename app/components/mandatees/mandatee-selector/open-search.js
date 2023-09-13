import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

/**
 * @argument multiple
 * @argument disabled
 * @argument selectedMandatee
 * @argument onSelectMandatee
 * @argument excludeMandatees
 * @argument {Date} referenceDate: Date to get active Mandatees for
 */
export default class MandateeSelector extends Component {
  @service mandatees;

  @tracked mandateeOptions = [];

  get referenceDate() {
    return this.args.referenceDate || new Date();
  }

  get dropdownAlignment() {
    if (this.args.dropdownAlignment === 'top') {
      return 'above';
    } else if (this.args.dropdownAlignment === 'bottom') {
      return 'below';
    } else {
      return 'auto';
    }
  }

  @restartableTask
  *searchMandatee(searchTerm) {
    this.mandateeOptions = [];
    yield timeout(300);
    const mandateeOptions = yield this.mandatees.fetchMandateesByName.perform(
      searchTerm,
      this.referenceDate
    );

    this.mandateeOptions = mandateeOptions.filter(
      (mandatee) => !this.args.excludeMandatees?.includes(mandatee)
    );
  }
}
