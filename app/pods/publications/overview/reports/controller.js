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
    const inCreationToast = this.toaster.loading(
      this.intl.t('publication-report--toast-generating--message'),
      this.intl.t('publication-report--toast-generating--title'),
      {
        timeOut: 3 * 60 * 1000,
      }
    );

    const now = new Date();

    const reportNameDatePrefix = moment(now).format('YYYYMMDDhhmmss');
    const reportNameType = dasherize(this.intl.t(this.titleKey));
    const reportName = `${reportNameDatePrefix}-${reportNameType}`;

    const query = this.getReportQueryParams(params);

    const user = yield this.currentSession.user;

    const job = this.store.createRecord('publication-metrics-export-job', {
      created: now,
      timeStarted: now,
      generatedBy: user,
      metricsType: this.key,
      config: {
        name: reportName,
        query: query,
      },
    });
    this.lastJob = job;

    yield job.save();

    yield this.jobMonitor.monitor(job);

    this.toaster.toasts.removeObject(inCreationToast);

    if (job.status === job.SUCCESS) {
      const file = yield job.belongsTo('generated').reload();
      const filename = file.downloadName;
      const downloadLink = file.namedDownloadLink;

      const fileDownloadToast = {
        title: this.intl.t('publication-report--toast-ready--title'),
        message: this.intl.t('publication-report--toast-ready--message'),
        type: 'download-file',
        options: {
          timeOut: 10 * 60 * 1000,
          downloadLink: downloadLink,
          fileName: filename,
        },
      };

      this.toaster.displayToast.perform(fileDownloadToast);
    } else {
      this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
    }
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
