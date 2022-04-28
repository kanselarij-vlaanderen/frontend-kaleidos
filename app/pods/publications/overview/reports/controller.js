import Controller from '@ember/controller';
import EmberObject from '@ember/object';
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

  @tracked lastJob;

  get titleKey() {
    return `publication-reports--type--${this.key}`;
  }

  @task
  *loadData() {
    this.lastJob = yield this.store.queryOne('publication-metrics-export-job', {
      sort: '-created',
      'filter[metrics-type]': this.key,
      include: ['generated', 'generated-by'].join(','),
    });
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

    const job = await this.createReportRecord(params);
    this.lastJob = job;
    await job.save();
    this.jobMonitor.register(job);
    job.on('didEnd', this, async function (status) {
      this.toaster.clear(generatingToast);
      if (status === job.SUCCESS) {
        const file = await job.generated;
        const downloadFileToast = {
          title: this.intl.t('publication-report--toast-ready--title'),
          message: this.intl.t('publication-report--toast-ready--message'),
          type: 'download-file',
          options: {
            timeOut: 10 * 60 * 1000,
            downloadLink: file.namedDownloadLink,
            fileName: file.downloadName,
          }
        };
        this.toaster.displayToast.perform(downloadFileToast);
      } else {
        this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
      }
    });
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
