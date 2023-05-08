import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import { task } from 'ember-concurrency';

/**
 * @param signMarkingActivity {SignMarkingActivityModel|Promise<SignMarkingActivityModel>}
 */
export default class SignaturePillComponent extends Component {
  @service intl;

  @tracked signingHubUrl;
  @tracked isMarked = false;
  @tracked isPrepared = false;
  @tracked hasToBeApproved = false;
  @tracked hasToBeSigned = false;
  @tracked isSigned = false;
  @tracked isRefused = false;

  constructor() {
    super(...arguments);

    this.loadData.perform();
  }

  get skin() {
    if (this.isRefused) {
      return "error";
    } else {
      return "link"
    }
  }

  get title() {
    if (this.isRefused) {
      return this.intl.t('refused');
    } else if (this.isSigned) {
      return this.intl.t('signed');
    } else if (this.hasToBeSigned) {
      return this.intl.t('to-sign');
    } else if (this.hasToBeApproved) {
      return this.intl.t('to-approve');
    } else if (this.isPrepared) {
      return this.intl.t('sent');
    } else if (this.isMarked) {
      return this.intl.t('to-sign');
    }
    return "";
  }

  loadData = task(async () => {
    const signMarkingActivity = await this.args.signMarkingActivity;
    if (signMarkingActivity) {
      const signSubcase = await signMarkingActivity.signSubcase;
      const signPreparationActivity = await signSubcase.signPreparationActivity;
      const signApprovalActivities = await signSubcase.signApprovalActivities;
      const signSigningActivities = await signSubcase.signSigningActivities;
      const signCompletionActivity = await signSubcase.signCompletionActivity;
      const signRefusalActivities = await signSubcase.signRefusalActivities;

      this.isMarked = !!signMarkingActivity;
      this.isPrepared = !!signPreparationActivity;
      this.hasToBeApproved = signApprovalActivities?.length && !signSigningActivities?.length;
      this.hasToBeSigned = signSigningActivities?.length && !signCompletionActivity;
      this.isSigned = !!signCompletionActivity;
      this.isRefused = signRefusalActivities?.length;

      if (!this.isRefused) {
        const signFlow = await signSubcase.signFlow;
        const response = await fetch(`/signing-flows/${signFlow.id}/pieces/${this.args.piece.id}/signinghub-url`);
        if (response.ok) {
          const result = await response.json();
          this.signingHubUrl = result.url;
        }
      }
    }
  });
}
