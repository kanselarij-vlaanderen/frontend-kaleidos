import Service from '@ember/service';
import { A } from '@ember/array';
import { task, timeout } from 'ember-concurrency';

export default class JobMonitorService extends Service {
  jobs = A([]);

  register(job) {
    this.jobs.pushObject(job);
    this.monitorJobProgress.perform(job);
  }

  @task
  *monitorJobProgress(job) {
    while (!job.hasEnded) {
      yield timeout(1000);
      yield job.reload();
    }
    return job;
  }
}
