import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { startOfDay } from 'date-fns';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';
import constants from 'frontend-kaleidos/config/constants';
import { isPresent } from '@ember/utils';

export default class MandateeSelectorPanel extends Component {
  @service mandatees;
  @service intl;
  @service currentSession;

  @tracked currentMinisters = []; // do not edit this array
  @tracked currentMandatees = []; // do not edit this array
  @tracked selectedCurrentMinisters = [];
  @tracked submitterMandatee;

  @tracked selectedCurrentMandatees = [];
  @tracked selectedPastMandatees = [];
  @tracked selectedAllMandatees = [];
  @tracked excludedMandatees = [];
  @tracked openSearch = false;
  @tracked selectedPastMandatee;
  @tracked showSubmitter = true;

  constructor() {
    super(...arguments);
    this.prepareCurrentMinisters.perform();
    this.panelTitle = this.args.title || this.intl.t('ministers');
    if (isPresent(this.args.showSubmitter)) {
      this.showSubmitter = this.args.showSubmitter;
    }
  }

  get areLoadingTasksRunning() {
    return (
      this.prepareCurrentMinisters.isRunning || this.loadArgsMinister.isRunning
    );
  }

  @action
  async onChangeSelectedCurrentMinisters(selected) {
    let selectedMandatees = [];
    selected.forEach((selectedMinister) => {
      const mandatee = this.currentMandatees.find(
        (currentMandatee) =>
          currentMandatee.person.get('id') === selectedMinister.id
      );
      selectedMandatees.push(mandatee);
    });
    selectedMandatees = selectedMandatees.sort(
      (m1, m2) => m1.priority - m2.priority
    );
    const sortedMinisters = await Promise.all(
      selectedMandatees.map((m) => m.person)
    );
    this.selectedCurrentMinisters = [...new Set(sortedMinisters)];
    this.selectedCurrentMandatees = selectedMandatees;
    this.setAllMandatees();

    // when there is no submitter: get the first from this list if any exist
    // when the submitter exists, check if it is still in selectedAllMandatees
    // If not, first from list again, if undefined submitter will be cleared
    if (
      (this.showSubmitter && this.submitterMandatee &&
        !this.selectedAllMandatees.find(
          (selectedMandatee) =>
            selectedMandatee.id ===
            this.submitterMandatee.id
        )) ||
      (!this.submitterMandatee && this.selectedAllMandatees.length)
    ) {
      this.submitterMandatee = this.selectedAllMandatees[0];
      if (this.showSubmitter) {
        this.args.setSubmitter(this.submitterMandatee);
      }
    }
  }

  @task // run once
  *prepareCurrentMinisters() {
    const currentMandatees = yield this.mandatees.getMandateesActiveOn.perform(
      startOfDay(new Date())
    );
    // filter out the MP's other role as a MINISTER
    const primeMinister = currentMandatees.find(
        (mandatee) =>
          mandatee.mandate.get('role').get('uri') ===
          constants.MANDATE_ROLES.MINISTER_PRESIDENT
      );
    const ministers = currentMandatees.filter(
      (minister) =>
      minister.person.get('id') !== primeMinister.person.get('id')
    );
    const filteredMandatees = [primeMinister, ...ministers];

    this.currentMandatees = filteredMandatees.sort(
      (m1, m2) => m1.priority - m2.priority
    );
    const sortedMinisters = yield Promise.all(
      this.currentMandatees.map((m) => m.person)
    );
    this.currentMinisters = [...new Set(sortedMinisters)];
    this.setExcludedMandatees();
    this.loadArgsMinister.perform();
  }

  @task // run once
  *loadArgsMinister() {
    if (this.args.mandatees?.length) {
      let selectedMandatees = [];
      // Only select args mandatees if they are still active
      for (const oldMandatee of this.args.mandatees) {
        const mandatee = this.currentMandatees.find(
          (currentMandatee) =>
            currentMandatee.get('id') === oldMandatee.id
        );
        if (mandatee) {
          // the mandatee is a current one
          selectedMandatees.push(mandatee);
        } else {
          // best effort to match the mandatee person to a current one
          const oldMandateePerson = yield oldMandatee.person;
          const minister = this.currentMinisters.find(
            (currentMinister) => currentMinister.get('id') === oldMandateePerson.id
          )
          if (minister) {
            const activeMandatee = this.currentMandatees.find(
              (currentMandatee) => 
              currentMandatee.person.get('id') === minister.id
              )
            // the mandatee is old, but the person still has an active mandatee
            selectedMandatees.push(activeMandatee);
          } else {
            if (this.currentSession.may('add-past-mandatees')) {
              // the person of the mandatee is no longer active
              this.selectedPastMandatees.push(oldMandatee);
            }
          }
        }
      }
      const ministersToSelect = yield Promise.all(
        selectedMandatees?.map((m) => m.person)
      );
      // Try to match the args.submitter to an entry from the mandatees list
      if (this.showSubmitter) {
        // First try to select the active mandatee of the submitter person
        const argsSubmitterPerson = yield this.args.submitter?.person;
        const submitterMandatee = this.currentMandatees.find(
          (currentMandatee) =>
            currentMandatee.person.get('id') === argsSubmitterPerson.id
        );
        if (submitterMandatee) {
          this.submitterMandatee = submitterMandatee;
        } else {
          // Second try to see if the mandatee was added to past mandatees (submitter is no longer active)
          const oldSubmitterMandatee = this.selectedPastMandatees.find(
            (pastMandatee) =>
            pastMandatee.get('id') === this.args.submitter.id
          );
          if (oldSubmitterMandatee && this.currentSession.may('add-past-mandatees')) {
            this.submitterMandatee = oldSubmitterMandatee;
          } 
        }
      }
      if (ministersToSelect?.length) {
        yield this.onChangeSelectedCurrentMinisters(ministersToSelect);
      } else if (this.selectedPastMandatees.length && this.currentSession.may('add-past-mandatees')) {
        this.setAllMandatees();
        this.setExcludedMandatees();
      } else {
        // clear the args mandatees and submitter if only old mandatees were present
        this.args.setMandatees([]);
      }
    }
  }

  @action
  onChangeSubmitter(mandatee) {
    const submitterMandatee = this.selectedAllMandatees.find(
      (currentMandatee) =>
        currentMandatee.get('id') === mandatee.id
    );
    this.submitterMandatee = submitterMandatee;
    if (this.showSubmitter) {
      this.args.setSubmitter(submitterMandatee);
    }
  }

  @action
  setAllMandatees() {
    // current mandatees always on top
    this.selectedAllMandatees = [...this.selectedCurrentMandatees, ...this.selectedPastMandatees];
    this.args.setMandatees(this.selectedAllMandatees);
  }

  @action
  setExcludedMandatees() {
    // all checkbox mandatees + the manually added past mandatees
    this.excludedMandatees = [...this.currentMandatees, ...this.selectedPastMandatees];
  }

  @action
  async onAddPastMandatee() {
    if (!this.selectedPastMandatee) {
      return;
    }
    let unsortedPastMandatees = this.selectedPastMandatees.slice();
    unsortedPastMandatees.push(this.selectedPastMandatee);

    // with open search there is no guarantee that priorities will be unique numbers, but we sort anyway
    const sortedMandatees = unsortedPastMandatees.sort(
      (m1, m2) => m1.priority - m2.priority
    );
    await Promise.all(
      sortedMandatees.map((m) => m.person)
    );
    this.selectedPastMandatees = sortedMandatees;
    this.setAllMandatees();
    this.setExcludedMandatees();

    // Only if there is no submitter yet we make this added mandatee the submitter
    if (!this.submitterMandatee && this.showSubmitter) {
      this.submitterMandatee = this.selectedPastMandatee;
      this.args.setSubmitter(this.submitterMandatee);
    }
    // if multiple need to be added it will be easier to keep the modal open, only clear the selection
    this.selectedPastMandatee = null;
  }

  @action
  async removePastMandatee(mandatee) {
    removeObject(this.selectedPastMandatees, mandatee);
    this.setAllMandatees();
    this.setExcludedMandatees();
    // change submitter if it was this mandatee and update args
    if (this.submitterMandatee.id === mandatee.id && this.showSubmitter) {
      this.submitterMandatee = this.selectedAllMandatees[0];
      this.args.setSubmitter(this.submitterMandatee);
    }
  }
}
