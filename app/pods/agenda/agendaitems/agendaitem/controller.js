import Controller, { inject as controller } from '@ember/controller';
import {
  action,
  set
} from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaAgendaitemsAgendaitemController extends Controller {
  @tracked meeting;
  @tracked agenda;
  @tracked notas;
  @tracked announcements;
  @tracked newItems;

  @controller('agenda.agendaitems') agendaitemsController;

  @action
  searchAgendaitems(value) {
    set(this.agendaitemsController, 'filter', value);
  }

  @action
  toggleShowModifiedOnly() {
    set(this.agendaitemsController, 'showModifiedOnly', !this.agendaitemsController.showModifiedOnly);
  }
}
