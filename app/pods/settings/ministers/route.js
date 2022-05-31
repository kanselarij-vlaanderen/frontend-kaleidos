import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class SettingsMinistersRoute extends Route {
  /*
  This route is currently a read-only-feature.
  The original minister-management feature wasn't designed with the full
  complexity of the mandatees/government-body model in mind. Edit-features
  are currently disabled awaiting re-design.
  For more info on the mandatee-model, see https://themis.vlaanderen.be/docs/catalogs
  */
  @service mandatees;

  async model() {
    const today = moment().startOf('day').toDate(); // Round date for higher caching efficiency
    const currentMandatees = await this.mandatees.getMandateesActiveOn.perform(today);
    return currentMandatees;
  }
}
