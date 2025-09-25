import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { trackedFunction } from 'reactiveweb/function';
import { TrackedArray } from 'tracked-built-ins';
import { tracked } from '@glimmer/tracking';

export default class SignaturesCreateSignFlowReportOrMinutesComponent extends Component {
  @service store;

  @tracked signers = new TrackedArray([]);

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
    const decisionActivitiesOrMeetings = this.args.decisionActivities.slice();

    let hasConflictingSigners = false;

    const [head, ...tail] = decisionActivitiesOrMeetings;
    const secretary = await head.secretary;

    for (let decisionActivityOrMeeting of tail) {
      const _secretary = await decisionActivityOrMeeting.secretary;

      if (secretary?.id !== _secretary?.id) {
        hasConflictingSigners = true;
        break;
      }
    }
    this.signers = new TrackedArray([]);
    if (!hasConflictingSigners && secretary) {
      this.signers = new TrackedArray([secretary]);
    }
    this.args.onChangeSigners?.(this.signers);
    return {
      hasConflictingSigners,
    };
  });
}
