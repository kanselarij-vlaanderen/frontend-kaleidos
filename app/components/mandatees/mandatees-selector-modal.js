import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @callback {() => Promise} onClose
 * @callback {(mandatee: Mandatee) => Promise} onLink
 * @dependsOn {Mandatee[]} mandatees ('mandatee,mandatee.person')
 * @GovernmentBodyOfDate Date of Case, Agenda or PublicationFlow to find the Mandatees of the right date
 */
export default class MandateesMandateesSelectorModalComponent extends Component {
  @tracked selectedMandatee;

  get canAdd() {
    return !!this.selectedMandatee;
  }

  @task
  *onAdd() {
    yield this.args.onAdd(this.selectedMandatee);
  }
}
