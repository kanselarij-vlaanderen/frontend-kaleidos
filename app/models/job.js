import Model, { attr } from '@ember-data/model';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import Evented from '@ember/object/evented';
import CONFIG from 'frontend-kaleidos/config/constants';

export default class JobModel extends Model.extend(Evented) {
  RUNNING = CONFIG.JOB_STATUSSES.RUNNING;
  SUCCESS = CONFIG.JOB_STATUSSES.SUCCESS;
  FAILED = CONFIG.JOB_STATUSSES.FAILED;

  @attr('datetime') created;
  @attr('string') status;
  @attr('datetime') timeStarted;
  @attr('datetime') timeEnded;

  constructor() {
    super(...arguments);
    // eslint-disable-next-line ember/no-observers, ember/classic-decorator-no-classic-methods
    this.addObserver('hasEnded', function() {
      if (this.hasEnded) {
        this.trigger('didEnd', this.status);
      }
    });
  }

  @computed('status', 'FAILED', 'SUCCESS')
  get hasEnded() {
    return this.status === this.SUCCESS || this.status === this.FAILED;
  }
}
