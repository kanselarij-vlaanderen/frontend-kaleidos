import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import reportTypes from 'frontend-kaleidos/config/publications/report-types';

export default class PublicationsOverviewReportsRoute extends Route {
  @service intl;

  async model() {
    const responsePromises = reportTypes.map((reportType) => {
      return this.store.queryOne('publication-metrics-export-job', {
        sort: '-created',
        'filter[metrics-type]': reportType.metricsTypeUri,
        include: ['generated', 'generated-by'].join(','),
      });
    });
    const lastReportGenerations = await Promise.all(responsePromises);
    return reportTypes.map((reportType, i) => {
      return {
        title: this.intl.t(reportType.translationKey),
        uri: reportType.metricsTypeUri,
        lastReportGeneration: lastReportGenerations[i]
      }
    });
  }
}
