import Service from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default class JobMonitorService extends Service {

  register(job, callbackFn) {
    this.monitorJobProgress.perform(job, callbackFn);
  }

  @task
  *monitorJobProgress(job, callbackFn) {
    while (!job.hasEnded) {
      yield timeout(1000);
      yield job.reload();
    }
    yield callbackFn(job);
    return job;
  }
}
