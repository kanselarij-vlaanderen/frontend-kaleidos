import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
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

searchMandatee = task({ restartable: true }, async (searchTerm) => {
    this.mandateeOptions = [];
    await timeout(300);
    const excludedMandatees = await this.args.excludeMandatees;
    const mandateeOptions = await this.mandatees.fetchMandateesByName.perform(
      searchTerm,
      this.referenceDate
    );

    this.mandateeOptions = mandateeOptions.filter(
      (mandatee) => !excludedMandatees?.includes(mandatee)
    );
  });

  @action
  onSelectMandatee(mandatee) {
    this.mandateeOptions = [];
    this.args.onSelectMandatee(mandatee);
  }
}
