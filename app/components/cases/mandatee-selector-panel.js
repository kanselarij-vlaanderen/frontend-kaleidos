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
  @tracked tempMandatees = [];

  constructor() {
    super(...arguments);
    this.prepareCurrentMinisters.perform();
  }

  @action
  async onChangeSelectedMinisters(selected) {
    this.selectedCurrentMinisters = selected;
    const selectedMandatees = [];
    selected.forEach(selectedMinister => {
      const mandatee = this.tempMandatees.find((tempMandatee) => tempMandatee.person.get('id') === selectedMinister.id);
      selectedMandatees.push(mandatee);
    });
    this.args.setMandatees(selectedMandatees);

    // if there is a submitter but this submitter can't be found in the selected mandatees, then set the submitter
    // to be the first selected minister. 
    // When there is no submitter but the list of selected ministers isn't empty, set submitter to first minister in the list
    if((this.args.submitter && !this.tempMandatees.find((tempMandatee) => tempMandatee.person.get('id') === this.args.submitter.id)) 
    || (!this.args.submitter && this.selectedCurrentMinisters.length > 0)) {
      this.args.setSubmitter(this.tempMandatees.find((tempMandatee) => tempMandatee.person.get('id') === this.selectedCurrentMinisters[0]?.get("id")));
    }
  }

  @task
  *prepareCurrentMinisters() {
    const currentMandatees = yield this.mandatees.getMandateesActiveOn.perform(startOfDay(new Date()));
    this.tempMandatees = currentMandatees
          .sort((m1, m2) => m1.priority - m2.priority)
    const sortedMinisters = yield Promise.all(
      this.tempMandatees.map((m) => m.person)
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
    const submitterMandatee = this.tempMandatees.find((tempMandatee) => tempMandatee.person.get('id') === submitterMinister.id);
    this.args.setSubmitter(submitterMandatee);
  }  
}