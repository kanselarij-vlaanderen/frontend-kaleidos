import Route from '@ember/routing/route';
import { ReportTypeRows } from './controller';

export default class PublicationsOverviewReportsRoute extends Route {
  model() {
    return ReportTypeRows.map((Row) => {
      return new Row();
    });
  }
}
