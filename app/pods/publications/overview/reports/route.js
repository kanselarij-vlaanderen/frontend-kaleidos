import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import REPORT_TYPES_CONFIG from 'frontend-kaleidos/config/publications/report-types';
import { ReportTypeEntry } from './controller'

export default class PublicationsOverviewReportsRoute extends Route {
  @service store;

  model() {
    const rowPromises = REPORT_TYPES_CONFIG.map(async (reportTypeConfig) => {
      const lastJob = await this.store.queryOne('publication-metrics-export-job', {
        sort: '-created',
        'filter[metrics-type]': reportTypeConfig.metricsTypeUri,
        include: ['generated', 'generated-by'].join(','),
      });
      return new ReportTypeEntry(lastJob, reportTypeConfig);
    });
    return Promise.all(rowPromises);
  }
}
