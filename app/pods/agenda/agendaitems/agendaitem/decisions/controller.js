import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class DecisionAgendaitemAgendaitemsAgendaController extends Controller {
  @service currentSession;

  @service store;

  @action
  async addTreatmentFromController() {
    console.log(this);
    console.log(this.agendaitem);
    if (this.agendaitem) {
      console.log('this.agendaItem exists');
      const newTreatment = this.store.createRecord('agenda-item-treatment', {
        created: moment().utc()
          .toDate(),
        modified: moment().utc()
          .toDate(),
        agendaitem: this.agendaitem,
      });
      console.log('newtreatment save');
      await newTreatment.save();
      console.log('newtreatment save done');
      this.refresh();
    } else {
      console.error('this.agendaItem does not exist.');
    }
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
