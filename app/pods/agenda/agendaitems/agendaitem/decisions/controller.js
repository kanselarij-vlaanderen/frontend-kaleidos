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

  get treatments() {
    return this.model;
  }

  @action
  async addTreatment() {
    const startDate = this.meeting.plannedStart;
    const now = new Date();
    const agendaActivity = await this.agendaitem.agendaActivity;
    const subcase = await agendaActivity?.subcase
    const newTreatment = this.store.createRecord('agenda-item-treatment', {
      created: now,
      modified: now,
      startDate: startDate,
      agendaitem: this.agendaitem,
      subcase: subcase,
    });
    await newTreatment.save();
    await this.newsletterService.linkNewsItemToNewTreatment(this.agendaitem);
    this.refresh();
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
