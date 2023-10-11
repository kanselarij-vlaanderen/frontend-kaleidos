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
    const fileMeta = await this.exportPdf.perform(report, 'generate-minutes-report');
    await this.replaceFile(minutes, fileMeta.id);
  });

  exportPdf = task(async (report, urlBase) => {
    const resp = await fetch(`/${urlBase}/${report.id}`);
    if (!resp.ok) {
      this.toaster.error(this.intl.t('error-while-exporting-pdf'));
      return;
    }
    return await resp.json();
  });

  async replaceFile(report, fileId) {
    await deleteFile(report.file);
    const file = await this.store.findRecord('file', fileId);
    report.file = file;
    report.modified = new Date();
    await report.save();
  }
}
