import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { TrackedArray } from 'tracked-built-ins';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 */
export default class SignaturesCreateSignFlowComponent extends Component {
  @service mandatees;
  @service store;

  @tracked showMinisterModal = false;
  @tracked showApproversModal = false;
  @tracked showNotificationAddressesModal = false;

  @tracked signers = new TrackedArray([]);
  @tracked approvers = new TrackedArray([]);
  @tracked notificationAddresses = new TrackedArray([]);

  primeMinister = null;

  constructor() {
    super(...arguments);
    this.loadSigners.perform();
  }

  get isLoading() {
    return this.loadSigners.isRunning;
  }

  loadSigners = task(async () => {
    this.primeMinister = await this.store.queryOne('mandatee', {
      'filter[mandate][role][:uri:]': CONSTANTS.MANDATE_ROLES.MINISTER_PRESIDENT,
      'filter[:lt:start]': new Date().toISOString(),
      'filter[:has-no:end]': true,
      include: 'person,mandate.role',
    });
    if (this.primeMinister) {
      this.signers.push(this.primeMinister);
    }

    const subcase = await this.args.decisionActivity.subcase;
    const mandatee = await subcase.requestedBy;
    await mandatee?.person;
    if (mandatee) {
      this.signers.push(mandatee);
    }
  });

  @action
  saveApprover(approver) {
    this.approvers.addObject(approver);
    this.showApproversModal = false;
  }

  @action
  removeApprover(approver) {
    this.approvers.removeObject(approver);
  }

  @action
  saveNotificationAddress(address) {
    this.notificationAddresses.addObject(address);
    this.showNotificationAddressesModal = false;
  }

  @action
  removeNotificationAddress(address) {
    this.notificationAddresses.removeObject(address);
  }

  saveSigners = task(async (selected) => {
    const records = await this.mandateeIdsToRecords(selected);
    const filtered = await this.filterSelectedSigners(records);
    this.signers = filtered.sortBy('priority');
    this.showMinisterModal = false;
  });

  @action
  removeSigner(signer) {
    this.signers.removeObject(signer);
  }

  async mandateeIdsToRecords(mandatees) {
    return Promise.all(
      mandatees.map((id) => this.store.findRecord('mandatee', id))
    );
  }

  /**
   * Filter the selected ministers for signing so that it only contains
   * the selected mandatees except for the Minister-President's non-PM
   * mandatee.
   */
  async filterSelectedSigners(selected) {
    const filtered = new Set();
    for (const mandatee of selected) {
      if (this.primeMinister) {
        const primeMinisterPerson = await this.primeMinister.person;
        const person = await mandatee.person;
        if (person.id === primeMinisterPerson.id) {
          if (mandatee.id === this.primeMinister.id) {
            filtered.add(this.primeMinister);
          }
          continue;
        }
      }
      filtered.add(mandatee);
    }
    return [...filtered];
  }
}
