import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default class DecisionAgendaitemAgendaitemsAgendaController extends Controller {
  @service currentSession;
  @service store;

  @alias('model') treatments;

  @action
  async addTreatment() {
    if (this.agendaitem) {
      const now = new Date();
      const newTreatment = this.store.createRecord('agenda-item-treatment', {
        created: now,
        modified: now,
        startDate: now,
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
