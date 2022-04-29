import Controller from '@ember/controller';
import EmberObject, { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import { task } from 'ember-concurrency';

class BaseRow extends EmberObject {
  /**
   * @abstract
   * @member {String} key
   */

  /**
   * @abstract
   * @method getReportQueryParams
   * @returns {{ [key: string]: any }}
   */

  @service store;
  @service intl;
  @service currentSession;
  @service toaster;
  @service jobMonitor;

  @tracked lastLoadedJob;
  @tracked lastStartedJob;

  get titleKey() {
    return `publication-reports--type--${this.key}`;
  }

  get lastJob() {
    return this.lastStartedJob || this.lastLoadedJob;
  }

  @task
  *loadAndMonitorJob() {
    this.lastLoadedJob = yield this.store.queryOne(
      'publication-metrics-export-job',
      {
        sort: '-created',
        'filter[metrics-type]': this.key,
        include: ['generated', 'generated-by'].join(','),
      }
    );
    if (this.lastLoadedJob && !this.lastLoadedJob.hasEnded) {
      yield this.jobMonitor.monitor(this.lastLoadedJob);
      if (this.lastLoadedJob.status === this.lastLoadedJob.SUCCESS) {
        // reload generated relationship is needed for template to rerender
        // the template then triggers this network call again (but a workaround seems to complex for this issue)
        yield this.lastLoadedJob.belongsTo('generated').reload();
      }
    }
  }

  @action
  cancelLoadAndMonitorJob() {
    this.loadAndMonitorJob.last?.cancel();
    if (this.lastLoadedJob) {
      this.jobMonitor.stopMonitoring(this.lastLoadedJob);
    }
  }

  @task
  *triggerGenerateReport(params) {
    yield this.performGenerateReport(params);
  }

  async performGenerateReport(params) {
    const generatingToast = this.toaster.loading(
      this.intl.t('publication-report--toast-generating--message'),
      this.intl.t('publication-report--toast-generating--title'),
      {
        timeOut: 3 * 60 * 1000,
      }
    );

    this.cancelLoadAndMonitorJob();
    let file;
    try {
      file = await this.generateReport(params);
    } catch (err) {
      console.error(err);
      this.toaster.clear(generatingToast);
      this.toaster.error(err.message, this.intl.t('warning-title'));
      return;
    }

    const filename = file.downloadName;
    const downloadLink = file.namedDownloadLink;

    const downloadFileToast = {
      title: this.intl.t('publication-report--toast-ready--title'),
      message: this.intl.t('publication-report--toast-ready--message'),
      type: 'download-file',
      options: {
        timeOut: 10 * 60 * 1000,
        downloadLink: downloadLink,
        fileName: filename,
      },
    };

    this.toaster.clear(generatingToast);
    this.toaster.displayToast.perform(downloadFileToast);
  }

  /** @private */
  async generateReport(params) {
    const job = await this.createReportRecord(params);
    this.lastStartedJob = job;
    await job.save();
    await this.jobMonitor.monitor(job);
    if (job.status === job.SUCCESS) {
      const file = await job.generated;
      return file;
    } else {
      throw new Error(this.intl.t('publication-report--toast-error--message'));
    }
  }

  /** @private */
  async createReportRecord(params) {
    const now = new Date();

    const reportNameDatePrefix = moment(now).format('YYYYMMDDHHmmss');
    const reportNameType = dasherize(this.intl.t(this.titleKey));
    const reportName = `${reportNameDatePrefix}-${reportNameType}`;

    const query = this.getReportQueryParams(params);

    const user = await this.currentSession.user;

    const job = this.store.createRecord('publication-metrics-export-job', {
      created: now,
      generatedBy: user,
      metricsType: this.key,
      config: {
        name: reportName,
        query: query,
      },
    });
    return job;
  }
}

class GovernmentDomainRow extends BaseRow {
  key = 'government-domain';

  getReportQueryParams() {
    return {
      group: this.key,
    };
  }
}

class RegulationTypeRow extends BaseRow {
  key = 'regulation-type';

  getReportQueryParams() {
    return {
      group: this.key,
    };
  }
}

// TODO: will be split up in "van BVR per minister" and "van decreet per minister"
class MandateeRow extends BaseRow {
  key = 'mandatee';

  getReportQueryParams() {
    return {
      group: this.key,
    };
  }
}

export const ReportTypeRows = [
  GovernmentDomainRow,
  RegulationTypeRow,
  MandateeRow,
];

export default class PublicationsOverviewReportsController extends Controller {}
