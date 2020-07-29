import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class DecisionAgendaitemAgendaitemsAgendaController extends Controller {
  @service currentSession;

  @service store;

  @action
  async addTreatmentFromController() {
    if (this.agendaItem) {
      const newTreatment = this.store.createRecord('agenda-item-treatment', {
        created: moment().utc()
          .toDate(),
        modified: moment().utc()
          .toDate(),
        agendaitem: this.agendaItem,
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
