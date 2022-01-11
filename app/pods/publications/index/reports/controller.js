import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class PublicationsReportsController extends Controller {
  @tracked reportOneModal = false;
  @tracked reportTwoModal = false;
  @tracked reportThreeModal = false;
  @tracked reportFourModal = false;
  @tracked reportFiveModal = false;
  @tracked reportSixModal = false;
  @tracked reportSevenModal = false;
  @service toaster;
  @service intl;

  @task
  *success() {
    const fileDownloadToast = {
      title: this.intl.t('successfully-created-report-ready'),
      type: 'download-report',
      options: {
        timeOut: 60 * 10 * 1000,
      },
    };

    fileDownloadToast.options.downloadLink = "202112171112-publicatie-exacte-datum.csv";
    fileDownloadToast.options.fileName = "202112171112-publicatie-exacte-datum.csv";

    yield timeout(5000);
    this.toaster.displayToast.perform(
      fileDownloadToast
    );
  }

  @action
  openReportTwoModal() {
    this.reportTwoModal = true;
  }

  @action
  closeReportTwoModal() {
    this.reportTwoModal = false;
  }

  @action
  async confirmReportTwoModal(event) {
    this.reportTwoModal = false;
    this.toaster.loading(
      this.intl.t('successfully-created-report'),
      this.intl.t('successfully-created-report-title'),
      {
        timeOut: 5000,
      }
    );
    this.success.perform();
  }

  @action
  openReportThreeModal() {
    this.reportThreeModal = true;
  }

  @action
  closeReportThreeModal() {
    this.reportThreeModal = false;
  }

  @action
  async confirmReportThreeModal(event) {
    this.reportThreeModal = false;
    this.toaster.loading(
      this.intl.t('successfully-created-report'),
      this.intl.t('successfully-created-report-title'),
      {
        timeOut: 5000,
      }
    );
    this.success.perform();
  }

  @action
  openReportFourModal() {
    this.reportFourModal = true;
  }

  @action
  closeReportFourModal() {
    this.reportFourModal = false;
  }

  @action
  async confirmReportFourModal(event) {
    this.reportFourModal = false;
    this.toaster.loading(
      this.intl.t('successfully-created-report'),
      this.intl.t('successfully-created-report-title'),
      {
        timeOut: 5000,
      }
    );
    this.success.perform();
  }

  @action
  openReportFiveModal() {
    this.reportFiveModal = true;
  }

  @action
  closeReportFiveModal() {
    this.reportFiveModal = false;
  }

  @action
  async confirmReportFiveModal(event) {
    this.reportFiveModal = false;
    this.toaster.loading(
      this.intl.t('successfully-created-report'),
      this.intl.t('successfully-created-report-title'),
      {
        timeOut: 5000,
      }
    );
    this.success.perform();
  }

  @action
  openReportSixModal() {
    this.reportSixModal = true;
  }

  @action
  closeReportSixModal() {
    this.reportSixModal = false;
  }

  @action
  async confirmReportSixModal(event) {
    this.reportSixModal = false;
    this.toaster.loading(
      this.intl.t('successfully-created-report'),
      this.intl.t('successfully-created-report-title'),
      {
        timeOut: 5000,
      }
    );
    this.success.perform();
  }

  @action
  openReportSevenModal() {
    this.reportSevenModal = true;
  }

  @action
  closeReportSevenModal() {
    this.reportSevenModal = false;
  }

  @action
  async confirmReportSevenModal(event) {
    this.reportSevenModal = false;
    this.toaster.loading(
      this.intl.t('successfully-created-report'),
      this.intl.t('successfully-created-report-title'),
      {
        timeOut: 5000,
      }
    );
    this.success.perform();
  }
}
