import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PublicationsOverviewReportsController extends Controller {
  @service store;
  @service router;
  @service intl;
  @service currentSession;
  @service toaster;
  @service jobMonitor;

  createExportJob(reportTypeEntry, userParams) {
    const now = new Date();

    const fixedParams = reportTypeEntry.config.fixedParams;
    const jobParams = {
      query: {
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
      reportType: reportTypeEntry.model,
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
    const thisRouteName = this.router.currentRouteName;
    job.on('didEnd', this, async (status) => {
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
        if (this.router.isActive(thisRouteName)) {
          this.router.refresh();
        }
      } else {
        this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
      }
    });
  }
}
