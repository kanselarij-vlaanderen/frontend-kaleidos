import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import moment from 'moment';

export default class DecisionAgendaitemAgendaitemsAgendaController extends Controller {
  @service currentSession;
  @service store;

  @alias('model') treatments;

  @action
  async addTreatment() {
    if (this.agendaitem) {
      const newTreatment = this.store.createRecord('agenda-item-treatment', {
        created: moment().utc()
          .toDate(),
        modified: moment().utc()
          .toDate(),
        agendaitem: this.agendaitem,
        subcase: this.subcase,
        newsletterInfo: await this.treatments.firstObject.newsletterInfo,
      });
      await newTreatment.save();
      this.refresh();
    }
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
