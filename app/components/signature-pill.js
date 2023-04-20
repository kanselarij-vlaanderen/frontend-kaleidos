import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @param signMarkingActivity {SignMarkingActivityModel|Promise<SignMarkingActivityModel>}
 */
export default class SignaturePillComponent extends Component {
  @tracked isMarked = false;
  @tracked isPrepared = false;
  @tracked isSigned = false;

  constructor() {
    super(...arguments);

    this.loadData.perform();
  }

  loadData = task(async () => {
    const signMarkingActivity = await this.args.signMarkingActivity;
    if (signMarkingActivity) {
      const signSubcase = await signMarkingActivity.signSubcase;
      const signPreparationActivity = await signSubcase.signPreparationActivity;
      const signCompletionActivity = await signSubcase.signCompletionActivity;

      this.isMarked = !!signMarkingActivity;
      this.isPrepared = !!signPreparationActivity;
      this.isSigned = !!signCompletionActivity;
    }
  });
}
