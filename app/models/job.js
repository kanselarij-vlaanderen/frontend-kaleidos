import Model, { attr } from '@ember-data/model';
import Evented from '@ember/object/evented';
// eslint-disable-next-line ember/no-observers
import {
  observer, computed
} from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend(Evented, {
  RUNNING: Object.freeze('http://vocab.deri.ie/cogs#Running'),
  SUCCESS: Object.freeze('http://vocab.deri.ie/cogs#Success'),
  FAILED: Object.freeze('http://vocab.deri.ie/cogs#Fail'),

  created: attr(),
  status: attr(),
  timeStarted: attr(),
  timeEnded: attr(),
  hasEnded: computed('status', 'FAILED', 'SUCCESS', function() {
    return this.status === this.SUCCESS || this.status === this.FAILED;
  }),

  // eslint-disable-next-line ember/no-observers
  statusObserver: observer('hasEnded', function() {
    if (this.hasEnded) {
      this.trigger('didEnd', this.status);
    }
  }),
});
