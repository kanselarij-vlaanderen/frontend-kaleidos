import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import * as CONFIG from 'frontend-kaleidos/config/config';

/**
 * @argument dateRange
 * @argument onChange
 * @argument multiple
 * @argument selectedPersons
 * @argument selectedPerson
*/

export default class MandateePersonSelector extends Component {
  @service store;
  @service mandatees;

  @tracked mandateePersons;
  @tracked selectedMandateePerson;
  @tracked selectedMandateePersons = [];


  constructor() {
    super(...arguments);
    this.loadMandateePersons();

    if(this.args.multiple){
      this.selectedMandateePersons = this.args.selectedPersons || [];
    } else {
      this.selectedMandateePerson = this.args.selectedPerson;
    }
  }

  @action
  loadMandateePersons() {
    // Assign a promise to mandateePersons to enable loading state on ember-power-select
    this.mandateePersons = this.fetchMandateePersons.perform(undefined);
  }

  @action
  onChange(newValue) {
    if (this.args.multiple) {
      this.selectedMandateePersons = newValue;
    } else {
      this.selectedMandateePerson = newValue;
    }
    if (typeof this.args.onChange === "function"){
      this.args.onChange(newValue);
    }
  }

  @task({
    restartable: true,
  })
  // only called when search text input is not empty
  *searchMandateePersons(searchText) {
    yield timeout(CONFIG.LIVE_SEARCH_DEBOUNCE_TIME);
    return this.fetchMandateePersons.perform(searchText);
  }

  @task
  *fetchMandateePersons(searchText) {
    const [dateRangeStart, dateRangeEnd] = this.args.dateRange || [undefined, undefined];
    const mandatees = yield this.mandatees.getMandateesActiveOn.perform(dateRangeStart, dateRangeEnd, searchText);
    const persons = [];
    for (const mandatee of mandatees) {
      const person = yield mandatee.person;
      persons.addObject(person);
    }

    return persons.sortBy('lastName');
  }
}