import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { TrackedArray } from 'tracked-built-ins';
import { trackedFunction } from 'ember-resources/util/function';

export default class SignaturesCreateSignFlowReportOrMinutesComponent extends Component {
  @service store;

  @tracked showSecretaryModal = false;
  @tracked signers = new TrackedArray([]);
  @tracked hasConflictingSigners = false;

  constructor() {
    super(...arguments);
  }

  loadSigners = trackedFunction(this, async () => {
    if (!this.args.decisionActivities) {
      return;
    }
    const decisionActivitiesOrMeetings = this.args.decisionActivities.toArray();

    const [head, ...tail] = decisionActivitiesOrMeetings;
    const secretary = await head.secretary;

    for (let decisionActivityOrMeeting of tail) {
      const _secretary = await decisionActivityOrMeeting.secretary;

      if (secretary?.id !== _secretary?.id) {
        this.hasConflictingSigners = true;
        break;
      }
    }
    this.signers = new TrackedArray([]);
    if (!this.hasConflictingSigners && secretary) {
      this.signers = new TrackedArray([secretary]);
    }
    this.args.onChangeSigners?.(this.signers);
  });

  @action
  startEditSigners() {
    this.showSecretaryModal = true;
  }

  saveSigners = task(async (selected) => {
    this.signers = new TrackedArray([selected]);
    this.showSecretaryModal = false;

    this.args.onChangeSigners?.(this.signers);
  });

  @action
  removeSigner(signer) {
    this.signers.removeObject(signer);
    this.args.onChangeSigners?.(this.signers);
  }
}
