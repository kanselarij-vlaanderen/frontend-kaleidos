import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class DecisionAgendaitemAgendaitemsAgendaController extends Controller {
  @service currentSession;
  @service store;
  @service newsletterService;

  @tracked agendaitem;
  @tracked meeting;

  @action
  async addDecisionActivity() {
    const startDate = this.meeting.plannedStart;
    const agendaActivity = await this.agendaitem.agendaActivity;
    const subcase = await agendaActivity?.subcase;
    const newDecisionActivity = this.store.createRecord('decision-activity', {
      startDate: startDate,
      treatment: this.agendaItemTreatment,
      subcase: subcase,
    });
    await newDecisionActivity.save();
    this.refresh();
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
