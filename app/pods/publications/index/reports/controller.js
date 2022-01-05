import Controller from '@ember/controller';
import { action } from '@ember/object';
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

  @action
  openReportOneModal() {
    this.reportOneModal = true;
  }

  @action
  closeReportOneModal() {
    this.reportOneModal = false;
  }

  @action
  async confirmReportOneModal(event) {
    this.reportOneModal = false;
    this.toaster.success(this.intl.t('successfully-created-report'));
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
    this.toaster.success(this.intl.t('successfully-created-report'));
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
    this.toaster.success(this.intl.t('successfully-created-report'));
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
    this.toaster.success(this.intl.t('successfully-created-report'));
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
    this.toaster.success(this.intl.t('successfully-created-report'));
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
    this.toaster.success(this.intl.t('successfully-created-report'));
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
    this.toaster.success(this.intl.t('successfully-created-report'));
  }
}
