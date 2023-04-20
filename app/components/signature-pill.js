import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @param signMarkingActivity {SignMarkingActivityModel|Promise<SignMarkingActivityModel>}
 */
export default class SignaturePillComponent extends Component {
  @tracked isMarked = false;
  @tracked isPrepared = false;
  @tracked hasToBeApproved = false; // TODO: The necessary activities for this do not yet exist, so this is always false
  @tracked hasToBeSigned = false;
  @tracked isSigned = false;
  @tracked isCancelled = false;

  constructor() {
    super(...arguments);

    this.loadData.perform();
  }

  loadData = task(async () => {
    const signMarkingActivity = await this.args.signMarkingActivity;
    if (signMarkingActivity) {
      const signSubcase = await signMarkingActivity.signSubcase;
      const signPreparationActivity = await signSubcase.signPreparationActivity;
      const signSigningActivities = await signSubcase.signSigningActivites.toArray();
      const signCompletionActivity = await signSubcase.signCompletionActivity;
      const signCancellationActivity = await signSubcase.signCancellationActivity;

      this.isMarked = !!signMarkingActivity;
      this.isPrepared = !!signPreparationActivity;
      this.hasToBeSigned = signSigningActivities.length && !signCompletionActivity;
      this.isSigned = !!signCompletionActivity;
      this.isCancelled = !!signCancellationActivity;
    }
  });
}
