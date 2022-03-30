import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class SigningFlowStatusComponent extends Component {
  /**
   * Status widget indicating signing flow
   *
   * @argument signingFlow
   * TODO: make sure this status updates when entities dat determine status are updated.
   */
  SIGNING_STATUS = {
    MARKED: 'marked', // not yet sent to signinghub
    IN_PREPARATION: 'in_preparation', // sent to signinghub
    READY_FOR_SENDING: 'ready_for_sending', // ready for sending to signers
    AWAITING_SIGNATURES: 'awaiting_signatures',
    SIGNED: 'signed',
  };
  @tracked nSigners;
  @tracked nSigned;

  constructor() {
    super(...arguments);
    this.loadSigningFlowStatus.perform();
  }

  @task
  *loadSigningFlowStatus() {
    let status;
    const signSubcase = yield this.args.signingFlow.signSubcase;
    const signingActivities = yield signSubcase.signSigningActivities;
    this.nSigners = signingActivities.length;
    this.nSigned = signingActivities.reduce(
      (prev, cur) => prev + (cur.startDate ? 1 : 0),
      0 // initial value
    );
    if (this.nSigners) {
      if (this.nSigned) {
        status = this.SIGNING_STATUS.AWAITING_SIGNATURES;
      } else {
        status = this.SIGNING_STATUS.IN_PREPARATION; // or IN_PREPARATION ? How to distinguish? Depends on when signers are assigned?
      }
    } else {
      status = this.SIGNING_STATUS.MARKED;
    }
    return status;
  }
}
