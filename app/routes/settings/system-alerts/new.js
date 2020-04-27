import Route from '@ember/routing/route';
import moment from 'moment';

export default class NewSystemAlertsRoute extends Route {
  beforeModel() {
    const alert = this.store.createRecord('alert', {
      beginDate: moment(),
      endDate: moment().add(1, 'days'),
    });
    this.transitionTo('settings.system-alerts.edit', alert);
  }
}
