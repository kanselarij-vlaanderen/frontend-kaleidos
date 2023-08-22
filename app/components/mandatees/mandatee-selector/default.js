import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { startOfDay } from 'date-fns';

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

  get referenceDate() {
    return this.args.referenceDate || startOfDay(new Date());
  }

  mandateeOptions = this.loadMandatees();

  async loadMandatees() {
    const mandateeOptions = await this.mandatees.getMandateesActiveOn.perform(
      this.referenceDate
    );
    mandateeOptions.filter(
      (mandatee) => !this.args.excludeMandatees?.includes(mandatee)
    );

    return mandateeOptions;
  }
}
