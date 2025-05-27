import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { debug } from '@ember/debug';
import { tracked } from '@glimmer/tracking';
import {
  constructGenericArchiveName,
  fetchGenericArchivingJobWithPath,
  fileDownloadUrlFromJob,
} from 'frontend-kaleidos/utils/zip-agenda-files';
import DownloadFileToast from 'frontend-kaleidos/components/utils/toaster/download-file-toast';
import { all } from 'rsvp';

export default class DownloadDocumentsComponent extends Component {
  @service intl;
  @service toaster;
  @service store;
  @service jobMonitor;

  downloadOptions = [
    {
      label: this.intl.t('document-type-pdf-only'),
      value: 'pdf',
    },
    {
      label: this.intl.t('all-filetypes'),
      value: 'all',
    },
  ];

  @tracked downloadOption = this.downloadOptions[0].value;
  @tracked showDownloadDocuments = false;

  get selectedDownloadOption() {
    return this.downloadOption;
  }

  openDownloadDocuments = () => {
    this.showDownloadDocuments = true;
  }

  closeDownloadDocuments = () => {
    this.showDownloadDocuments = false;
  }

  onChangeDownloadOption = (selectedDownloadOption) => {
    this.downloadOption = selectedDownloadOption;
  }

  confirmDownloadDocuments = async() => {
    await this.downloadDocuments();
    this.closeDownloadDocuments();
  }

  downloadDocuments = async() => {
    const downloadFileToastOptions = {
      title: this.intl.t('file-ready'),
      message: this.intl.t('documents-download-ready'),
      timeOut: 60 * 10 * 1000,
    };
    const pdfOnly = this.downloadOption === 'pdf' ? true : false;
    const namePromise = constructGenericArchiveName();
    debug('Checking if archive exists ...');
    const jobPromise = fetchGenericArchivingJobWithPath(
      this.args.archivePath,
      this.store,
      pdfOnly
    );
    const [name, job] = await all([namePromise, jobPromise]);
    if (!job) {
      this.toaster.warning(
        this.intl.t('no-documents-to-download-warning-text'),
        this.intl.t('no-documents-to-download-warning-title'),
        {
          timeOut: 10000,
        }
      );
      return;
    }
    if (!job.hasEnded) {
      debug('Archive in creation ...');
      const inCreationToast = this.toaster.loading(
        this.intl.t('archive-in-creation-message'),
        this.intl.t('archive-in-creation-title'),
        {
          timeOut: 3 * 60 * 1000,
        }
      );
      this.jobMonitor.register(job, async (job) => {
        this.toaster.close(inCreationToast);
        if (job.status === job.SUCCESS) {
          const url = await fileDownloadUrlFromJob(job, name);
          debug(`Archive ready. Prompting for download now (${url})`);
          downloadFileToastOptions.downloadLink = url;
          this.toaster.show(DownloadFileToast, downloadFileToastOptions);
        } else {
          debug('Something went wrong while generating archive.');
          this.toaster.error(
            this.intl.t('error'),
            this.intl.t('warning-title')
          );
        }
      });
    } else {
      const url = await fileDownloadUrlFromJob(job, name);
      debug(`Archive ready. Prompting for download now (${url})`);
      downloadFileToastOptions.downloadLink = url;
      this.toaster.show(DownloadFileToast, downloadFileToastOptions);
    }
  }
}
