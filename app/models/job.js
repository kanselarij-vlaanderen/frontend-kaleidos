import DS from 'ember-data';
import Evented from '@ember/object/evented';
import { observer, computed } from '@ember/object';

export default DS.Model.extend(Evented, {
  RUNNING: Object.freeze('http://vocab.deri.ie/cogs#Running'),
  SUCCESS: Object.freeze('http://vocab.deri.ie/cogs#Success'),
  FAILED: Object.freeze('http://vocab.deri.ie/cogs#Fail'),

  created: DS.attr(),
  status: DS.attr(),
  timeStarted: DS.attr(),
  timeEnded: DS.attr(),
  hasEnded: computed('status', function () {
    return this.status === this.SUCCESS || this.status === this.FAILED;
  }),

  statusObserver: observer('hasEnded', function () {
    if (this.hasEnded) {
      this.trigger('didEnd', this.status);
    }
  }),
});
