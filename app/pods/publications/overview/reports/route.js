import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { ReportTypeRows } from './controller';

export default class PublicationsOverviewReportsRoute extends Route {
  model() {
    let owner = getOwner(this).ownerInjection();
    return ReportTypeRows.map((Row) => {
      // owner argument to an EmberObject: necessary for @service injection
      const row = Row.create(owner, {});
      // outside of constructor(): it depends on the subtype fields that have not yet been set in the constructor
      row.loadAndMonitorJob.perform();
      return row;
    });
  }
}
