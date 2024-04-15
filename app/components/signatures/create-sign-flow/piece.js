import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { TrackedArray } from 'tracked-built-ins';
import { trackedFunction } from 'reactiveweb/function';
import { startOfDay } from 'date-fns';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { addObject, removeObject } from 'frontend-kaleidos/utils/array-helpers';

export default class SignaturesCreateSignFlowPieceComponent extends Component {
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
  }

  get hasConflictingSigners() {
    return this.loadSigners.value?.hasConflictingSigners ?? false;
  }

  loadSigners = trackedFunction(this, async () => {
    if (!this.args.decisionActivities) {
      return;
    }
    const decisionActivities = this.args.decisionActivities.slice();

    let hasConflictingSigners = false;

    const [head, ...tail] = decisionActivities;

    this.primeMinister = await this.store.queryOne('mandatee', {
      'filter[mandate][role][:uri:]': CONSTANTS.MANDATE_ROLES.MINISTER_PRESIDENT,
      'filter[:lte:start]': startOfDay(new Date()).toISOString(),
      'filter[:has-no:end]': true,
      include: 'person,mandate.role',
    });

    const getSubmitterAndCosigners = async (decisionActivity) => {
      const subcase = await decisionActivity.subcase;
      const submitter = await subcase?.requestedBy;
      const cosigners = (await subcase?.mandatees) ?? [];
      return { submitter, cosigners };
    };

    const { submitter, cosigners } = await getSubmitterAndCosigners(head);

    for (let decisionActivity of tail) {
      const { submitter: _submitter, cosigners: _cosigners } =
        await getSubmitterAndCosigners(decisionActivity);

      if (submitter?.id !== _submitter?.id) {
        hasConflictingSigners = true;
        break;
      }
      if (_cosigners.length !== cosigners.length) {
        hasConflictingSigners = true;
        break;
      }
      const _cosignersIds = _cosigners.map((signer) => signer.id);
      const cosignersIds = cosigners.map((signer) => signer.id);
      for (const mandateeId of _cosignersIds) {
        if (!cosignersIds.includes(mandateeId)) {
          hasConflictingSigners = true;
          break;
        }
      }
      if (hasConflictingSigners) break;
    }
    if (hasConflictingSigners) {
      this.signers = new TrackedArray([]);
    } else {
    const signersSet = new Set();
      signersSet.add(this.primeMinister);
      const primeMinisterPerson = await this.primeMinister.person;

      if (submitter) {
        const submitterPerson = await submitter.person;
        if (primeMinisterPerson.id !== submitterPerson.id) {
          signersSet.add(submitter);
        }
      }

      for (let cosigner of cosigners) {
        if (cosigner) {
          const cosignerPerson = await cosigner.person;
          if (primeMinisterPerson.id !== cosignerPerson.id) {
            signersSet.add(cosigner);
          }
        }
      }
      this.signers = new TrackedArray([...signersSet]);
    }
    this.args.onChangeSigners?.(this.signers);
    return {
      hasConflictingSigners,
    };
  });

  @action
  startEditSigners() {
    this.showMinisterModal = true;
  }

  @action
  saveApprover(approver) {
    addObject(this.approvers, approver.toLowerCase());
    this.showApproversModal = false;
    this.args.onChangeApprovers?.(this.approvers);
  }

  @action
  removeApprover(approver) {
    removeObject(this.approvers, approver);
    this.args.onChangeApprovers?.(this.approvers);
  }

  @action
  saveNotificationAddress(address) {
    addObject(this.notificationAddresses, address.toLowerCase());
    this.showNotificationAddressesModal = false;
    this.args.onChangeNotificationAddresses?.(this.notificationAddresses);
  }

  @action
  removeNotificationAddress(address) {
    removeObject(this.notificationAddresses, address);
    this.args.onChangeNotificationAddresses?.(this.notificationAddresses);
  }

  saveSigners = task(async (selected) => {
    const records = await this.mandateeIdsToRecords(selected);
    const filtered = await this.filterSelectedSigners(records);
    this.signers = filtered.sort((m1, m2) => m1.priority - m2.priority);
    this.showMinisterModal = false;

    this.args.onChangeSigners?.(this.signers);
  });

  @action
  removeSigner(signer) {
    removeObject(this.signers, signer);
    this.args.onChangeSigners?.(this.signers);
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
    return new TrackedArray([...filtered]);
  }
}
