import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import REPORT_TYPES_CONFIG from 'frontend-kaleidos/config/publications/report-types';
import { ReportTypeEntry } from './controller'

export default class PublicationsOverviewReportsRoute extends Route {
  @service store;

  async model() {
    let reportTypes = await this.store.findAll('publication-report-type');
    reportTypes = reportTypes.toArray();

    if (reportTypes.length !== REPORT_TYPES_CONFIG.length) {
      console.error('incorrect number of report types configured')
    }

    // configuration order determines order in UI
    const reportTypeEntries = REPORT_TYPES_CONFIG.map(async (reportTypeConfig) => {
      const reportType = reportTypes.findBy('uri', reportTypeConfig.metricsTypeUri);
      if (!reportType) {
        console.error('report type config uri does not exist')
      }

      const lastJob = await this.store.queryOne(
        'publication-metrics-export-job',
        {
          sort: '-created',
          'filter[type][:uri:]': reportType.uri,
          include: ['generated', 'generated-by'].join(','),
        }
      );
      return new ReportTypeEntry(lastJob, reportType, reportTypeConfig);
    });

    return Promise.all(reportTypeEntries);
  }
}
