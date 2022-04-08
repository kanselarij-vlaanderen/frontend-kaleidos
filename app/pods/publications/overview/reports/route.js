import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { ReportTypeRows } from './controller';


export default class PublicationsOverviewReportsRoute extends Route {
  @service store;
  @service intl;
  @service currentSession;

  model() {
    return ReportTypeRows.map((Row) => {
      const row = new Row({
        store: this.store,
        intl: this.intl,
        currentSession: this.currentSession,
      });
      // outside of constructor(): it depends on the subtype fields that have not yet been set in the constructor
      row.loadData.perform();
      return row;
    });
  }
}
