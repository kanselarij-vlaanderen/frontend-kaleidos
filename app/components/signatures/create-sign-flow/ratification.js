import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { trackedFunction } from 'reactiveweb/function';
import { TrackedArray } from 'tracked-built-ins'

export default class SignaturesCreateSignFlowRatificationComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);
  }

  get hasConflictingSigners() {
    return this.loadSigners.value?.hasConflictingSigners ?? false;
  }

  get signers() {
    return this.loadSigners.value?.signers ?? [];
  }

  loadSigners = trackedFunction(this, async () => {
    if (!this.args.decisionActivities) {
      return;
    }
    const decisionActivities = this.args.decisionActivities.slice();

    let hasConflictingSigners = false;
    let signers = [];

    const [head, ...tail] = decisionActivities;

    const getSigners = async (decisionActivity) => {
      const subcase = await decisionActivity.subcase;
      const ratifiers = await subcase?.ratifiedBy ?? [];
      return ratifiers;
    };

    const ratifiers = await getSigners(head);
    for (let decisionActivity of tail) {
      const _ratifiers =  await getSigners(decisionActivity);

      if (ratifiers.length !== _ratifiers.length) {
        hasConflictingSigners = true;
        break;
      }
      const _ratifiersIds = _ratifiers.map((signer) => signer.id);
      const ratifiersIds = ratifiers.map((signer) => signer.id);
      for (const mandateeId of _ratifiersIds) {
        if (!ratifiersIds.includes(mandateeId)) {
          hasConflictingSigners = true;
          break;
        }
      }
    }
    if (hasConflictingSigners) {
      signers = new TrackedArray([]);
    } else {
      signers = ratifiers;
    }
    this.args.onChangeSigners?.(signers);
    return {
      signers,
      hasConflictingSigners,
    };
  });
}
