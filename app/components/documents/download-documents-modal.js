import Component from '@glimmer/component';
import { service } from '@ember/service';
import { debug } from '@ember/debug';
import { tracked } from '@glimmer/tracking';
import {
  constructGenericArchiveName,
  fetchGenericArchivingJobWithPath,
  fileDownloadUrlFromJob,
} from 'frontend-kaleidos/utils/zip-agenda-files';
import DownloadFileToast from 'frontend-kaleidos/components/utils/toaster/download-file-toast';
import { all } from 'rsvp';

/**
 * @argument modalOpen: if the modal is showing
 * @argument onCancel
 * @argument archivePath: the path to the download service endpoint
 *
 * The archivePath should look like this: `/${modeltype(plural)}/${model.id}/pieces/files/archive`
 * first slash is needed or we attempt the current route instead (which fails).
 * model type should be plural (agendaitem > /agendaitems/id/...)
 * id should be of the model you want documents of
 * the relevant path should exist in dispatcher and redirect to a known route in the file-bundling-job-creation service
 *
 * If no documents are found we will not get a job returned and show that in a pop-up
 * If an error occurs we will do the same (no documents found pop-up)
 */
export default class DownloadDocumentsModalComponent extends Component {
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

  get selectedDownloadOption() {
    return this.downloadOption;
  }

  onChangeDownloadOption = (selectedDownloadOption) => {
    this.downloadOption = selectedDownloadOption;
  };

  confirmDownloadDocuments = async () => {
    await this.downloadDocuments();
    this.args.onCancel();
  };

  downloadDocuments = async () => {
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
      pdfOnly,
    );
    const [name, job] = await all([namePromise, jobPromise]);
    if (!job) {
      this.toaster.warning(
        this.intl.t('no-documents-to-download-warning-text'),
        this.intl.t('no-documents-to-download-warning-title'),
        {
          timeOut: 10000,
        },
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
        },
      );
      this.jobMonitor.register(job, async (job) => {
        this.toaster.close(inCreationToast);
        if (job.isSuccess) {
          const url = await fileDownloadUrlFromJob(job, name);
          debug(`Archive ready. Prompting for download now (${url})`);
          downloadFileToastOptions.downloadLink = url;
          this.toaster.show(DownloadFileToast, downloadFileToastOptions);
        } else {
          debug('Something went wrong while generating archive.');
          this.toaster.error(
            `${this.intl.t('documents-download-failed')} ${job.message}`,
            this.intl.t('warning-title'),
          );
        }
      });
    } else if (job.isSuccess) {
      const url = await fileDownloadUrlFromJob(job, name);
      debug(`Archive ready. Prompting for download now (${url})`);
      downloadFileToastOptions.downloadLink = url;
      this.toaster.show(DownloadFileToast, downloadFileToastOptions);
    } else {
      debug('Something went wrong while generating archive.');
      this.toaster.error(
        `${this.intl.t('documents-download-failed')} ${job.message}`,
        this.intl.t('warning-title'),
      );
    }
  };
}
