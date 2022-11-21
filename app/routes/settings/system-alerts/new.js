import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class NewSystemAlertsRoute extends Route {
  @service store;

  beforeModel() {
    const alert = this.store.createRecord('alert', {
      beginDate: moment(),
      endDate: moment().add(1, 'days'),
    });
    this.transitionTo('settings.system-alerts.edit', alert);
  }
}
