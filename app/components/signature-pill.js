import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import constants from 'frontend-kaleidos/config/constants';
import { trackedFunction } from 'ember-resources/util/function';

/**
 * @param signMarkingActivity {SignMarkingActivityModel|Promise<SignMarkingActivityModel>}
 */
export default class SignaturePillComponent extends Component {
  @service intl;
  @service currentSession;

  status = trackedFunction(this, async () => {
    const signMarkingActivity = await this.args.signMarkingActivity;
    const signSubcase = await signMarkingActivity.signSubcase;

    return await (await signSubcase.signFlow).status;
  });

  signingHubUrl = trackedFunction(this, async () => {
    const { SIGNED, REFUSED } = constants.SIGNFLOW_STATUSES;
    if (!this.status.value || this.status.value.uri === REFUSED) {
      return null;
    }

    const currentUser = this.currentSession.user;
    const status = this.status.value;
    const pieceArg = this.args.piece;
    const signMarkingActivity = await this.args.signMarkingActivity;
    const signSubcase = await signMarkingActivity.signSubcase;
    const piece = await pieceArg;
    const signFlow = await signSubcase.signFlow;
    const signFlowCreator = await signFlow.creator;

    if (piece && signFlowCreator.id === currentUser.id && !status.uri === SIGNED) {
      const response = await fetch(
        `/signing-flows/${signFlow.id}/pieces/${piece.id}/signinghub-url?collapse_panels=false`
      );
      if (response.ok) {
        const result = await response.json();
        return result.url;
      }
    } else {
      return null;
    }
  });

  get skin() {
    const { REFUSED, CANCELED } = constants.SIGNFLOW_STATUSES;
    if (this.status.value.uri === REFUSED || this.status.value.uri === CANCELED) {
      return 'error';
    } else if (this.signingHubUrl.value) {
      return 'link';
    } else {
      return 'ongoing';
    }
  }
}
