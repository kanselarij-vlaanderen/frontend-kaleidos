import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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

  @tracked openSearchMandateeOptions = [];

  get referenceDate() {
    return this.args.referenceDate || new Date();
  }

  get mandateeOptions() {
    if (!this.args.openSearch) {
      return this.loadMandatees();
    } else {
      return undefined;
    }
  }

  @action
  openSearchChanged() {
    this.openSearchMandateeOptions = [];
  }

  async loadMandatees() {
    const mandateeOptions = await this.mandatees.getMandateesActiveOn.perform(
      this.referenceDate
    );
    mandateeOptions.filter(
      (mandatee) => !this.args.excludeMandatees?.includes(mandatee)
    );

    return mandateeOptions;
  }

  @restartableTask
  *searchMandatee(searchTerm) {
    this.openSearchMandateeOptions = [];
    yield timeout(300);
    const mandateeOptions = yield this.mandatees.fetchMandateesByName.perform(
      searchTerm,
      this.referenceDate
    );

    this.openSearchMandateeOptions = mandateeOptions.filter(
      (mandatee) => !this.args.excludeMandatees?.includes(mandatee)
    );
  }
}
