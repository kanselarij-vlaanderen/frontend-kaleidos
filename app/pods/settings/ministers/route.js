import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class SettingsMinistersRoute extends Route {
  @service mandatees;

  async model() {
    const today = moment().startOf('day').toDate(); // Round date for higher caching efficiency
    const currentMandatees = await this.mandatees.getMandateesActiveOn.perform(today);
    return currentMandatees;
  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
