import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import DownloadFileToast from 'frontend-kaleidos/components/utils/toaster/download-file-toast';

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
    const thisRouteName = this.router.currentRouteName;
    this.jobMonitor.register(job, async (job) => {
      this.toaster.close(generatingToast);
      if (job.status === job.SUCCESS) {
        const file = await job.generated;
        const downloadFileToastOptions = {
          title: this.intl.t('publication-reports--toast-ready--title'),
          message: this.intl.t('publication-reports--toast-ready--message'),
          timeOut: 10 * 60 * 1000,
          downloadLink: file.namedDownloadLink,
        };
        this.toaster.show(DownloadFileToast, downloadFileToastOptions);
        if (this.router.isActive(thisRouteName)) {
          this.router.refresh(thisRouteName);
        }
      } else {
        this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
      }
    });
  }
}
