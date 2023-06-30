import Component from '@glimmer/component';
import { later, cancel } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import constants from 'frontend-kaleidos/config/constants';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { task } from 'ember-concurrency';
import { SIGN_FLOW_STATUS_REFRESH_INTERVAL_MS } from 'frontend-kaleidos/config/config';

const { SIGNED, REFUSED, CANCELED, MARKED } = constants.SIGNFLOW_STATUSES;

/**
 * @param signMarkingActivity {SignMarkingActivityModel|Promise<SignMarkingActivityModel>}
 */
export default class SignaturePillComponent extends Component {
  @service intl;
  @service currentSession;
  @service signatureService;

  scheduledRefresh;
  @tracked triggerTask;

  willDestroy() {
    super.willDestroy(...arguments);
    cancel(this.scheduledRefresh);
  }

  scheduleSignFlowStatusRefresh() {
    if (![REFUSED, SIGNED, CANCELED].includes(this.data?.value?.status?.uri)) {
      this.scheduledRefresh = later(this, async () => {
        this.triggerTask = new Date();
      }, SIGN_FLOW_STATUS_REFRESH_INTERVAL_MS);
    }
  }

  loadData = task(async () => {
    // Cancel the scheduled refresh, in case we're retriggering because
    // a dependency (marking activity) changed
    cancel(this.scheduledRefresh);

    const signMarkingActivity = await this.args.signMarkingActivity;
    if (!signMarkingActivity) return;
    const signSubcase = await signMarkingActivity.signSubcase;
    const signFlow = await signSubcase.signFlow;
    const status = await signFlow.belongsTo('status').reload();
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
        signingHubUrl = await this.signatureService.getSigningHubUrl(signFlow, piece);
      }
    }

    this.scheduleSignFlowStatusRefresh();

    return {
      signingHubUrl,
      status,
    };
  });

  data = trackedTask(this, this.loadData, () => [this.triggerTask]); // Make the resource dependant on this.triggerTask

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
