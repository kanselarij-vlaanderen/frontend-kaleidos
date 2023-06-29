import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import constants from 'frontend-kaleidos/config/constants';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { task } from 'ember-concurrency';

/**
 * @param signMarkingActivity {SignMarkingActivityModel|Promise<SignMarkingActivityModel>}
 */
export default class SignaturePillComponent extends Component {
  @service intl;
  @service currentSession;

  loadData = task(async () => {
    const { SIGNED, REFUSED, MARKED } = constants.SIGNFLOW_STATUSES;
    const signMarkingActivity = await this.args.signMarkingActivity;
    if (!signMarkingActivity) return;
    const signSubcase = await signMarkingActivity.signSubcase;
    const signFlow = await signSubcase.signFlow;
    const status = await signFlow.status;
    let signingHubUrl = null;

    if (status.uri !== REFUSED) {
      const piece = await this.args.piece;
      const signFlow = await signSubcase.signFlow;
      const signFlowCreator = await signFlow.creator;
      const currentUser = this.currentSession.user;
      if (
        piece &&
        signFlowCreator.id === currentUser.id &&
        status.uri !== SIGNED &&
        status.uri !== MARKED
      ) {
        const response = await fetch(
          `/signing-flows/${signFlow.id}/pieces/${piece.id}/signinghub-url?collapse_panels=false`
        );
        if (response.ok) {
          const result = await response.json();
          signingHubUrl = result.url;
        }
      }
    }

    return {
      signingHubUrl,
      status,
    };
  });

  data = trackedTask(this, this.loadData);

  get skin() {
    const { REFUSED, CANCELED } = constants.SIGNFLOW_STATUSES;
    const statusUri = this.data.value.status.uri;
    const signingHubUrl = this.data.value.signingHubUrl;
    if (statusUri === REFUSED || statusUri === CANCELED) {
      return 'error';
    } else if (signingHubUrl) {
      return 'link';
    } else {
      return 'ongoing';
    }
  }
}
