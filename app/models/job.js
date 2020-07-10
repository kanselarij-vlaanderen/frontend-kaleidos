import DS from 'ember-data';
import Evented from '@ember/object/evented';
import { computed } from '@ember/object';

export default DS.Model.extend(Evented, {
  RUNNING: Object.freeze('http://vocab.deri.ie/cogs#Running'),
  SUCCESS: Object.freeze('http://vocab.deri.ie/cogs#Success'),
  FAILED: Object.freeze('http://vocab.deri.ie/cogs#Fail'),

  created: DS.attr(),
  status: DS.attr(),
  timeStarted: DS.attr(),
  timeEnded: DS.attr(),
  hasEnded: computed('status', function () {
    const isSuccess = this.status === this.SUCCESS || this.status === this.FAILED;
    if(isSuccess) {
      this.trigger('didEnd', this.status);
    }
    return isSuccess;
  }),
});
