import Model, { attr } from '@ember-data/model';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import Evented from '@ember/object/evented';

export default class JobModel extends Model.extend(Evented) {
  RUNNING = 'http://vocab.deri.ie/cogs#Running';
  SUCCESS = 'http://vocab.deri.ie/cogs#Success';
  FAILED = 'http://vocab.deri.ie/cogs#Fail';

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
