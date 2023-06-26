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
  @service currentSession;

  @tracked signingHubUrl;
  @tracked isMarked = false;
  @tracked isPrepared = false;
  @tracked hasToBeApproved = false;
  @tracked hasToBeSigned = false;
  @tracked isSigned = false;
  @tracked isRefused = false;
  @tracked isCancelled = false;

  constructor() {
    super(...arguments);

    this.loadData.perform();
  }

  get skin() {
    if (this.isRefused || this.isCancelled) {
      return "error";
    } else if (this.signingHubUrl) {
      return "link"
    } else {
      return "ongoing"
    }
  }

  get title() {
    if (this.isCancelled) {
      return this.intl.t('cancelled');
    } else if (this.isRefused) {
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
      return this.intl.t('marked-for-signing');
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
      const signCancellationActivity = await signSubcase.signCancellationActivity;

      this.isMarked = !!signMarkingActivity;
      this.isPrepared = !!signPreparationActivity;
      this.hasToBeApproved = signApprovalActivities?.some((activity) => activity.startDate && !activity.endDate);
      this.hasToBeSigned = signSigningActivities?.some((activity) => activity.startDate && !activity.endDate);
      this.isSigned = !!signCompletionActivity;
      this.isRefused = signRefusalActivities?.length;
      this.isCancelled = !!signCancellationActivity;

      if (this.isPrepared && !this.isRefused && !this.isCancelled) {
        const piece = await this.args.piece;
        const signFlow = await signSubcase.signFlow;
        const signFlowCreator = await signFlow.creator;
        const currentUser = this.currentSession.user;
        if (piece && (signFlowCreator.id === currentUser.id) && !this.isSigned) {
          const response = await fetch(
            `/signing-flows/${signFlow.id}/pieces/${piece.id}/signinghub-url?collapse_panels=false`
          );
          if (response.ok) {
            const result = await response.json();
            this.signingHubUrl = result.url;
          } 
        }
      }
    }
  });
}
