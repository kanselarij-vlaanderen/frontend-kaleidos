import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { deleteFile } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class DecisionReportGeneration extends Service {
  @service toaster;
  @service store;
  @service intl;

  generateReplacementReport = task(async (report, type = 'decision') => {
    const fileMeta = await this.exportPdf.perform(report, type);
    await this.replaceFile(report, fileMeta.id);
  });

  exportPdf = task(async (report, type = 'decision') => {
    const typeToUrlBase = {
      decision: 'generate-decision-report',
      minutes: 'generate-minutes-report',
    };
    console.assert(Object.keys(typeToUrlBase).includes(type));
    const resp = await fetch(`/${typeToUrlBase[type]}/${report.id}`);
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
