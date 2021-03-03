import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaAgendaitemsAgendaitemController extends Controller {
  @tracked meeting;
  @tracked agenda;
  @tracked notas;
  @tracked announcements;

  @controller('agenda.agendaitems') agendaitemsController;

  @action
  searchAgendaitems(value) {
    this.agendaitemsController.filter = value;
  }

  @action
  toggleShowModifiedOnly() {
    this.agendaitemsController.showModifiedOnly = !this.agendaitemsController.showModifiedOnly;
  }
}
