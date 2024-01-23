import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { startOfDay } from 'date-fns';

export default class MandateeSelectorPanel extends Component {
  @service mandatees;

  @tracked currentMinisters = [];
  @tracked selectedCurrentMinisters = [];
  @tracked currentMandatees = [];

  constructor() {
    super(...arguments);
    this.prepareCurrentMinisters.perform();
  }

  @action
  async onChangeSelectedMinisters(selected) {
    let selectedMandatees = [];
    selected.forEach(selectedMinister => {
      const mandatee = this.currentMandatees.find((currentMandatee) => currentMandatee.person.get('id') === selectedMinister.id);
      selectedMandatees.push(mandatee);
    });
    selectedMandatees = selectedMandatees.sort(
      (m1, m2) => m1.priority - m2.priority
    );
    const sortedMinisters = await Promise.all(
      selectedMandatees.map((m) => m.person)
    );
    this.selectedCurrentMinisters = [...new Set(sortedMinisters)];
    this.args.setMandatees(selectedMandatees);

    // if there is a submitter but this submitter can't be found in the selected mandatees, then set the submitter
    // to be the first selected minister. 
    // When there is no submitter but the list of selected ministers isn't empty, set submitter to first minister in the list
    if((this.args.submitter && !selectedMandatees.find((selectedMandatee) => selectedMandatee.person.get('id') === this.args.submitter.person.get('id'))) 
    || (!this.args.submitter && this.selectedCurrentMinisters.length)) {
      this.args.setSubmitter(selectedMandatees.find((selectedMandatee) => selectedMandatee.person.get('id') === this.selectedCurrentMinisters[0]?.get("id")));
    }
  }

  @task
  *prepareCurrentMinisters() {
    const currentMandatees = yield this.mandatees.getMandateesActiveOn.perform(startOfDay(new Date()));
    this.currentMandatees = currentMandatees
          .sort((m1, m2) => m1.priority - m2.priority)
    const sortedMinisters = yield Promise.all(
      this.currentMandatees.map((m) => m.person)
    );
    this.currentMinisters = [...new Set(sortedMinisters)];
  }

  @action
  async checkIfSubmitter(minister) {
    const submitterPersonId = await this.args.submitter.person.get('id');
    return submitterPersonId === minister.id;
  }

  @action
  onChangeSubmitter(submitterMinister) {
    const submitterMandatee = this.currentMandatees.find((currentMandatee) => currentMandatee.person.get('id') === submitterMinister.id);
    this.args.setSubmitter(submitterMandatee);
  }  
}