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
export default class MandateesMandateesSelectorModalAltComponent extends Component {
  @tracked selectedMandatee = [];
  @tracked openSearch = false;

  get canAdd() {
    return !!this.selectedMandatee || this.onAdd.isRunning;
  }

  @task
  *onAdd() {
    for (let mandatee of this.selectedMandatee) {
      if (!this.args.buffer.includes(mandatee)) {
        yield this.args.onAdd(mandatee);
      }
    }
  }

  @action
  setOpenSearch(checked) {
    this.openSearch = checked;
  }
}
