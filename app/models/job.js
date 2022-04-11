import Model, { attr } from '@ember-data/model';

export default class JobModel extends Model {
  RUNNING = 'http://vocab.deri.ie/cogs#Running';
  SUCCESS = 'http://vocab.deri.ie/cogs#Success';
  FAILED = 'http://vocab.deri.ie/cogs#Fail';

  @attr('datetime') created;
  @attr('string') status;
  @attr('datetime') timeStarted;
  @attr('datetime') timeEnded;

  get hasEnded() {
    return this.status === this.SUCCESS || this.status === this.FAILED;
  }
}
