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
 * @param piece {Piece|Promise<Piece>}
 */
export default class SignaturePillComponent extends Component {
  @service intl;
  @service store;
  @service currentSession;
  @service signatureService;

  scheduledRefresh;
  @tracked triggerTask;

  get isClickable() {
    const signingHubUrl = this.data?.value?.signingHubUrl;
    const route = this.data?.value?.route;
    return !!signingHubUrl || !!route;
  }

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
    const signFlow = await signSubcase?.signFlow;
    let status = await signFlow?.belongsTo('status').reload();
    let signingHubUrl = null;
    let route = null;
    if (status) {
      if (status.uri === MARKED) {
        route = "signatures.index";
      }
      if (status.uri !== REFUSED &&
          status.uri !== CANCELED &&
          status.uri !== SIGNED &&
          status.uri !== MARKED) {
        const piece = await this.args.piece;
        const signFlow = await signSubcase.signFlow;
        const signFlowCreator = await signFlow.creator;
        const currentUser = this.currentSession.user;
        if (
          piece &&
          signFlowCreator?.id === currentUser.id
        ) {
          signingHubUrl = await this.signatureService.getSigningHubUrl(signFlow, piece);
        }
      }
    } else {
      // status can be null, if the sync service hasn't caught up yet. In this case we default to MARKED and wait for the next scheduled reload
      status = await this.store.findRecordByUri('concept', MARKED);
    }

    this.scheduleSignFlowStatusRefresh();

    return {
      signingHubUrl,
      status,
      route
    };
  });

  data = trackedTask(this, this.loadData, () => [this.triggerTask]); // Make the resource dependant on this.triggerTask

  get skin() {
    const statusUri = this.data?.value?.status?.uri;
    const signingHubUrl = this.data?.value?.signingHubUrl;
    const route = this.data?.value?.route;
    if (statusUri === REFUSED || statusUri === CANCELED) {
      return 'error';
    } else if (signingHubUrl || route) {
      return 'link';
    } else if (statusUri === SIGNED) {
      return 'success';
    }
    return 'default';
  }
}
