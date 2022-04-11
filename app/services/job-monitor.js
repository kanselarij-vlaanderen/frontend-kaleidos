import Service from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default class JobMonitorService extends Service {
  jobs = [];

  async monitor(job) {
    this.jobs.pushObject(job);
    await this.monitorJobProgress.perform(job);
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
