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
    const startDate = this.meeting.plannedStart;
    const now = new Date();
    const subcase = this.agendaitem.agendaActivity.get('subcase');
    const newsletterInfo = this.treatments.firstObject.newsletterInfo;
    const newTreatment = this.store.createRecord('agenda-item-treatment', {
      created: now,
      modified: now,
      startDate: startDate,
      agendaitem: this.agendaitem,
      subcase: subcase,
      newsletterInfo: newsletterInfo,
    });
    await newTreatment.save();
    this.refresh();
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
