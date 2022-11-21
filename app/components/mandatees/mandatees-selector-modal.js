import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @callback {() => Promise} onClose
 * @callback {(mandatee: Mandatee) => Promise} onLink
 * @dependsOn {Mandatee[]} mandatees ('mandatee,mandatee.person')
 * @argument {Date} referenceDate: Date to get active Mandatees for
 */
export default class MandateesMandateesSelectorModalComponent extends Component {
  @tracked selectedMandatee;
  @tracked openSearch = false;

  get canAdd() {
    return !!this.selectedMandatee;
  }

  @task
  *onAdd() {
    yield this.args.onAdd(this.selectedMandatee);
  }

  @action
  setOpenSearch(event) {
    this.openSearch = event.target.checked;
  }
}
