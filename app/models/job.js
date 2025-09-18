import Model, { attr } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class JobModel extends Model {
  @attr('string') uri;
  @attr('datetime') created;
  @attr('string') status;
  @attr('datetime') timeStarted;
  @attr('datetime') timeEnded;
  @attr('string') message;

  get isScheduled() {
    return this.status === CONSTANTS.JOB_STATUSES.SCHEDULED;
  }

  get isBusy() {
    return this.status === CONSTANTS.JOB_STATUSES.BUSY;
  }

  get isSuccess() {
    return this.status === CONSTANTS.JOB_STATUSES.SUCCESS;
  }

  get isFailed() {
    return this.status === CONSTANTS.JOB_STATUSES.FAILED;
  }

  get hasEnded() {
    return this.isSuccess || this.isFailed;
  }
}
