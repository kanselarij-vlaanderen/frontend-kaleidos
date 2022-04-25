import Service from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default class JobMonitorService extends Service {
  jobs = new Map();

  async monitor(job) {
    let monitorTask = this.jobs.get(job);
    if (!monitorTask) {
      monitorTask = this.monitorJobProgress.perform(job);
      this.jobs.set(job, monitorTask);
    }
    return await monitorTask;
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
