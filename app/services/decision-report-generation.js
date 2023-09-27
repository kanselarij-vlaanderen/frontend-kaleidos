import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class DecisionReportGeneration extends Service {
  @service toaster;
  @service store;
  @service intl;

  generateReplacementReports = task(async (reports) => {
    const generatingPDFToast = this.toaster.loading(
      this.intl.t('decision-report-generation--toast-generating--message'),
      this.intl.t('decision-report-generation--toast-generating--title'),
      {
        timeOut: 3 * 60 * 1000,
      }
    ); 
    const reportIDs = reports.map((report) => { return report.id });
    const data = {
      reportIDs: reportIDs
    };
    const url = `/generate-decision-report/generate`;
    const resp = await fetch(url, {
      method: 'post',
      headers: {
        'Content-type': 'application/vnd.api+json',
      },
      body: JSON.stringify(data),
    });
    this.toaster.close(generatingPDFToast);
    if (resp.ok) {
      this.toaster.success(
        this.intl.t('decision-report-generation--toast-generating-complete--message'),
        this.intl.t('decision-report-generation--toast-generating-complete--title')
      );
    } else {
      this.toaster.error(this.intl.t('error-while-exporting-pdf'));
    }
  });
}