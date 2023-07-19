import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @argument dateRange
 * @argument onChange
 * @argument multiple
 * @argument selectedPersons
 * @argument selectedPerson
 * @argument showLabel
 */

export default class MandateePersonSelector extends Component {
  @service store;
  @service mandatees;

  // LIMITATION:
  //  1. a person will not show up in the select
  //    if: a mandatee resigned in the year before the publication
  //  2. a person can be selected person that was not a mandatee in that year
  //    if a person is selected
  //      and then the publication year is changed

  @tracked selectedMandateePerson;
  @tracked selectedMandateePersons = [];

  constructor() {
    super(...arguments);

    if (this.args.multiple) {
      this.selectedMandateePersons = this.args.selectedPersons || [];
    } else {
      this.selectedMandateePerson = this.args.selectedPerson;
    }
  }

  @action
  onChange(newValue) {
    if (this.args.multiple) {
      this.selectedMandateePersons = newValue;
    } else {
      this.selectedMandateePerson = newValue;
    }
    if (typeof this.args.onChange === 'function') {
      this.args.onChange(newValue);
    }
  }

  loadOptions = new Promise((resolve) => {
    this.fetchMandateePersons().then(resolve);
  });

  async fetchMandateePersons() {
    const [dateRangeStart, dateRangeEnd] = this.args.dateRange || [
      undefined,
      undefined,
    ];
    const mandatees = await this.mandatees.getMandateesActiveOn.perform(
      dateRangeStart,
      dateRangeEnd
    );
    const persons = [];
    for (const mandatee of mandatees) {
      const person = await mandatee.person;
      persons.addObject(person);
    }

    return persons.sortBy('lastName');
  }
}
