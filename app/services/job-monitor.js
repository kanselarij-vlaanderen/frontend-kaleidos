import Service from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default class JobMonitorService extends Service {
  /**
   * @type {Map<JobModel, { task: Task, listenerCount: number }}
   */
  jobs = new Map();

  async monitor(job) {
    let monitoringContext = this.jobs.get(job);
    if (!monitoringContext) {
      const monitorTask = this.monitorJobProgress.perform(job);
      monitoringContext = {
        task: monitorTask,
        listenerCount: 1,
      };
      this.jobs.set(job, monitoringContext);
    } else {
      ++monitoringContext.listenerCount;
    }
    await monitoringContext.task;
  }

  stopMonitoring(job) {
    const monitoringContext = this.jobs.get(job);
    if (monitoringContext) {
      --monitoringContext.listenerCount;
      if (monitoringContext.listenerCount === 0) {
        monitoringContext.task.cancel();
      }
    }
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
