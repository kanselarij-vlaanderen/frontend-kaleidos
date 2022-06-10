import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * @argument title
 * @argument lastJob (optional)
 * @argument userInputFields
 * @argument onGenerateReport
 */
export default class PublicationsReportsReportsPanelEntry extends Component {
  @tracked isOpenGenerateReportModal;

  @action
  openGenerateReportModal() {
    this.isOpenGenerateReportModal = true;
  }

  @action
  closeGenerateReportModal() {
    this.isOpenGenerateReportModal = false;
  }

  @action
  generateReport(userParams) {
    this.args.onGenerateReport(userParams);
    this.isOpenGenerateReportModal = false;
  }
}
