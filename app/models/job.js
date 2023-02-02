import Model, { attr } from '@ember-data/model';
import CONFIG from 'frontend-kaleidos/config/constants';

export default class JobModel extends Model {
  RUNNING = CONFIG.JOB_STATUSSES.RUNNING;
  SUCCESS = CONFIG.JOB_STATUSSES.SUCCESS;
  FAILED = CONFIG.JOB_STATUSSES.FAILED;

  @attr('datetime') created;
  @attr('string') status;
  @attr('datetime') timeStarted;
  @attr('datetime') timeEnded;

  get hasEnded() {
    return this.status === this.SUCCESS || this.status === this.FAILED;
  }
}
