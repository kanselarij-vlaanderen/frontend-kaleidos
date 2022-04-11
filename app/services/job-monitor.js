import Service from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default class JobMonitorService extends Service {
  jobs = [];

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
