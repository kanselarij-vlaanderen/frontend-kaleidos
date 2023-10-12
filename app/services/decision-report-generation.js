import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { deleteFile } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class DecisionReportGeneration extends Service {
  @service toaster;
  @service store;
  @service intl;

  generateReplacementReport = task(async (report) => {
    const fileMeta = await this.exportPdf.perform(report, 'generate-decision-report');
    await this.replaceFile(report, fileMeta.id);
  });

  generateReplacementMinutes = task(async (minutes) => {
    const fileMeta = await this.exportPdf.perform(minutes, 'generate-minutes-report');
    await this.replaceFile(minutes, fileMeta.id);
  });

  exportPdf = task(async (report, urlBase) => {
    try {
      const response = await fetch(`/${urlBase}/${report.id}`);
      if (!response.ok) {
        this.toaster.error(this.intl.t('error-while-exporting-pdf'));
        return;
      }
      try {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `Backend response contained an error (status: ${response.status}): ${JSON.stringify(data)}`
          );
        }
        return data;
      } catch (error) {
        // Errors returned from services *should* still
        // be valid JSON(:API), but we could encounter
        // non-JSON if e.g. a service is down. If so,
        // throw a nice error that only contains the
        // response status.
        if (error instanceof SyntaxError) {
          throw new Error(
            `Backend response contained an error (status: ${response.status})`
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.toaster.error(
        error.message,
        this.toaster.error(this.intl.t('error-while-exporting-pdf'))
      )
    }
  });

  async replaceFile(report, fileId) {
    await deleteFile(report.file);
    const file = await this.store.findRecord('file', fileId);
    report.file = file;
    report.modified = new Date();
    await report.save();
  }
}
