import Route from '@ember/routing/route';
import { ReportTypeRows } from './controller';
import { inject as service } from '@ember/service';

export default class PublicationsOverviewReportsRoute extends Route {
  @service store;
  @service intl;
  @service currentSession;

  model() {
    return ReportTypeRows.map((Row) => {
      const row = new Row();
      return Object.assign(row, {
        store: this.store,
        intl: this.intl,
        currentSession: this.currentSession,
      });
    });
  }
}
