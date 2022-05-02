import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import reportTypes from 'frontend-kaleidos/config/publications/report-types';
import { ReportTypeRow } from './controller'

export default class PublicationsOverviewReportsRoute extends Route {
  @service store;
  @service intl;

  async model() {
    const rowPromises = reportTypes.map(async (reportType) => {
      const lastJob = await this.store.queryOne('publication-metrics-export-job', {
        sort: '-created',
        'filter[metrics-type]': reportType.metricsTypeUri,
        include: ['generated', 'generated-by'].join(','),
      });

      return new ReportTypeRow(lastJob, reportType);
    });
    return Promise.all(rowPromises);
  }
}
