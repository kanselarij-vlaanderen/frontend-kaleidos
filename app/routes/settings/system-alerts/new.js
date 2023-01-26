import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { addDays } from 'date-fns';

export default class NewSystemAlertsRoute extends Route {
  @service router;
  @service store;

  beforeModel() {
    const now = new Date();
    const alert = this.store.createRecord('alert', {
      beginDate: now,
      endDate: addDays(now, 1),
    });
    this.router.transitionTo('settings.system-alerts.edit', alert);
  }
}
