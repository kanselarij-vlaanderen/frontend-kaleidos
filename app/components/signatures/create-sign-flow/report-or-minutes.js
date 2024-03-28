import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { trackedFunction } from 'reactiveweb/function';

export default class SignaturesCreateSignFlowReportOrMinutesComponent extends Component {
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
    const decisionActivitiesOrMeetings = this.args.decisionActivities.slice();

    let hasConflictingSigners = false;
    let signers = [];

    const [head, ...tail] = decisionActivitiesOrMeetings;
    const secretary = await head.secretary;

    for (let decisionActivityOrMeeting of tail) {
      const _secretary = await decisionActivityOrMeeting.secretary;

      if (secretary?.id !== _secretary?.id) {
        hasConflictingSigners = true;
        break;
      }
    }
    signers = [];
    if (!hasConflictingSigners && secretary) {
      signers = [secretary];
    }
    this.args.onChangeSigners?.(signers);
    return {
      signers,
      hasConflictingSigners,
    };
  });
}
