import Service, { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default class JobMonitorService extends Service {
  @service store;

  async register(job, callbackFn=()=>{}) {
    return this.monitorJobProgress.perform(job, callbackFn);
  }

  async ensureNoJobExistsSince(
    referenceTime=new Date(),
    jobType='job',
    status,
    errorMessage
  ) {
    const startedJobExists = !!(await this.store.queryOne(jobType, {
      'filter[status]': status,
      'filter[:gte:time-started]': referenceTime.toISOString(),
    }));
    const endedJobExists = !!(await this.store.queryOne(jobType, {
      'filter[status]': status,
      'filter[:gte:time-ended]': referenceTime.toISOString(),
    }));
    if (startedJobExists || endedJobExists) {
      throw new Error(errorMessage || 'Er is iets gewijzigd sinds ' + referenceTime);
    }
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
