import Controller from '@ember/controller';
import EmberObject, { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

class BaseRow extends EmberObject {
  /**
   * @abstract
   * @member {String} key
   */

  /**
   * @member {{[filterKey: string]: any}} fixedQueryFilter fixed filter for publication-report-service query
   * @default {{}} can be overriden
   */
  fixedQueryFilter = {};

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
  @tracked isShownGenerateReportModal;

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

  @action
  showGenerateReportModal() {
    this.isShownGenerateReportModal = true;
  }

  @action
  closeGenerateReportModal() {
    this.isShownGenerateReportModal = false;
  }

  @task
  *triggerGenerateReport(params) {
    this.isShownGenerateReportModal = false;
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
  async createReportRecord(modalParams) {
    const now = new Date();

    const reportNameDatePrefix = moment(now).format('YYYYMMDDHHmmss');
    const reportNameType = dasherize(this.intl.t(this.titleKey));
    const reportName = `${reportNameDatePrefix}-${reportNameType}`;

    const filter = Object.assign(modalParams.filter, this.fixedQueryFilter);
    const query = {
      group: this.group,
      filter: filter,
    };

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

// per beslissingsdatum
class ByMandatee_OnDecisionDate extends BaseRow {
  key = 'by-mandatee--on-decision-date';

  group = 'mandatee';
  // fixed query filters for this report type
  fixedQueryFilter = {};
  // user input fields for query filters
  filterFields = {
    decisionDateRange: true,
  };
}

// per beleidsdomein
class ByGovernmentDomain extends BaseRow {
  key = 'by-government-domain';

  group = 'government-domain';
  fixedQueryFilter = {};
  filterFields = {
    publicationYear: true,
    governmentDomain: true,
  };
}

// BVR per minister
class ByMandatee_OnlyBVR extends BaseRow {
  key = 'by-mandatee--only-bvr';

  group = 'mandatee';
  fixedQueryFilter = {
    regulationType: [CONSTANTS.REGULATION_TYPES.BVR],
  };
  filterFields = {
    publicationYear: true,
    mandatee: true,
  };
}

// per type regelgeving buiten ministerraad
class ByRegulationType_OnlyNotViaCouncilOfMinisters extends BaseRow {
  key = 'by-regulation-type--only-not-via-council-of-ministers';

  fixedQueryFilter = {
    isViaCouncilOfMinisters: false,
  };
  group = 'regulation-type';
  filterFields = {
    publicationYear: true,
  };
}

// per type regelgeving
class ByRegulationType extends BaseRow {
  key = 'by-regulation-type';

  group = 'regulation-type';
  filterFields = {
    publicationYear: true,
    regulationType: true,
  };
}

// Decreten per minister
class ByMandatee_OnlyDecree extends BaseRow {
  key = 'by-mandatee--only-decree';

  fixedQueryFilter = {
    regulationType: [CONSTANTS.REGULATION_TYPES.DECREET],
  };
  group = 'mandatee';
  filterFields = {
    publicationYear: true,
    mandatee: true,
  };
}

export const ReportTypeRows = [
  ByMandatee_OnDecisionDate,
  ByGovernmentDomain,
  ByMandatee_OnlyBVR,
  ByRegulationType_OnlyNotViaCouncilOfMinisters,
  ByRegulationType,
  ByMandatee_OnlyDecree,
];

export default class PublicationsOverviewReportsController extends Controller {}
