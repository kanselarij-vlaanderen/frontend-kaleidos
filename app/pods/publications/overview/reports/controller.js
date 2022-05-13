import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export class ReportTypeEntry {
  constructor(lastJob, type, config) {
    this.lastJob = lastJob;
    this.type = type;
    this.config = config;
  }
}

export default class PublicationsOverviewReportsController extends Controller {
  @service store;
  @service intl;
  @service currentSession;
  @service toaster;
  @service jobMonitor;

  createExportJob(reportTypeEntry, userParams) {
    const now = new Date();

    // TODO: Aside from a default (which can be constructed as follows),
    // Configurable naming isn't in the current scope of service functionality and hence shouldn't be part of config.
    // In case the frontend has special naming requirements, then these can be fullfilled
    // by editing the file name after the fact in the frontend and saving through mu-cl-resources
    const reportNameDatePrefix = moment(now).format('YYYYMMDDHHmmss');
    const reportNameType = 'rapport'; // TODO: to be moved to backend
    const reportName = `${reportNameDatePrefix}-${reportNameType}`;

    const fixedParams = reportTypeEntry.config.fixedParams;
    /// TODO: use _.deepmerge
    const jobParams = {
      name: reportName, // TODO: see comment above: move default namign logic to server
      query: {
        // TODO: Adapt backend to be able to remove this "query" part.
        //Query config shouldn't be required in this unparametrized setup.
        // A "metricsType" should be enough
        group: fixedParams.query.group,
        filter: {
          ...fixedParams.query.filter,
          ...userParams.query.filter,
        },
      },
    };

    const job = this.store.createRecord('publication-metrics-export-job', {
      created: now,
      generatedBy: this.currentSession.user,
      type: reportTypeEntry.type,
      config: jobParams,
    });
    return job;
  }

  @action
  async generateReport(reportTypeEntry, userParams) {
    const generatingToast = this.toaster.loading(
      this.intl.t('publication-reports--toast-generating--message'),
      this.intl.t('publication-reports--toast-generating--title'),
      {
        timeOut: 3 * 60 * 1000,
      }
    );
    const job = this.createExportJob(reportTypeEntry, userParams);
    await job.save();
    this.jobMonitor.register(job);
    job.on('didEnd', this, async function (status) {
      this.toaster.clear(generatingToast);
      if (status === job.SUCCESS) {
        const file = await job.generated;
        const downloadFileToast = {
          title: this.intl.t('publication-reports--toast-ready--title'),
          message: this.intl.t('publication-reports--toast-ready--message'),
          type: 'download-file',
          options: {
            timeOut: 10 * 60 * 1000,
            downloadLink: file.namedDownloadLink,
            fileName: file.downloadName,
          },
        };
        this.toaster.displayToast.perform(downloadFileToast);
        // TODO: reload model in order to update new lastReportGeneration
      } else {
        this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
      }
    });
  }
}
