import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class PublicationsOverviewReportsController extends Controller {
  @service store;
  @service intl;
  @service currentSession;
  @service toaster;
  @service jobMonitor;

  createExportJob(reportTypeUri) {
    const now = new Date();

    // TODO: Aside from a default (which can be constructed as follows),
    // Configurable naming isn't in the current scope of service functionality and hence shouldn't be part of config.
    // In case the frontend has special naming requirements, then these can be fullfilled
    // by editing the file name after the fact in the frontend and saving through mu-cl-resources
    const reportNameDatePrefix = moment(now).format('YYYYMMDDHHmmss');
    const reportNameType = 'to-be-moved-to-backend';
    const reportName = `${reportNameDatePrefix}-${reportNameType}`;

    const job = this.store.createRecord('publication-metrics-export-job', {
      created: now,
      generatedBy: this.currentSession.user,
      metricsType: reportTypeUri,
      config: {
        name: reportName, // TODO: see comment above: move default namign logic to server
        query: { // TODO: Adapt backend to be able to remove this "query" part.
          //Query config shouldn't be required in this unparametrized setup.
          // A "metricsType" should be enough
          group: reportTypeUri,
        },
      },
    });
    return job;
  }

  @action
  async generateReport(type) {
    const generatingToast = this.toaster.loading(
      this.intl.t('publication-reports--toast-generating--message'),
      this.intl.t('publication-reports--toast-generating--title'),
      {
        timeOut: 3 * 60 * 1000,
      }
    );
    const job = this.createExportJob(type);
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
        // TODO: reload model in order to update new lastReportGeneration
      } else {
        this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
      }
    });
  }
}
