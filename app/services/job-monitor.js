import Service from '@ember/service';
import { A } from '@ember/array';
import {
  task, timeout
} from 'ember-concurrency';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Service.extend({
  jobs: null,

  init() {
    this._super(...arguments);
    this.set('jobs', A([]));
  },

  register(job) {
    this.jobs.pushObject(job);
    this.monitorJobProgress.perform(job);
  },

  monitorJobProgress: task(function *(job) {
    while (!job.hasEnded) {
      yield timeout(1000);
      yield job.reload();
    }
    return job;
  }),
});
