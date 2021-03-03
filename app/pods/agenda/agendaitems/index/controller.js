import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { setAgendaitemsPriority } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class AgendaitemsAgendaController extends Controller {
  @service sessionService;
  @service agendaService;

  @tracked filter;
  @tracked showModifiedOnly;

  @tracked meeting;
  @tracked agenda;
  @tracked previousAgenda;

  @controller('agenda.agendaitems') agendaitemsController;

  @action
  searchAgendaitems(value) {
    this.agendaitemsController.filter = value;
  }

  @task
  *assignNewPriorities(reorderedAgendaitems, draggedAgendaItem) {
    // reorderedAgendaitems includes all items on the whole page. We only want to re-order within one category (nota/announcement/...)
    const reorderedAgendaitemsOfCategory = reorderedAgendaitems.filter((item) => item.showAsRemark === draggedAgendaItem.showAsRemark);
    yield setAgendaitemsPriority(reorderedAgendaitemsOfCategory, true, true); // permissions guarded in template (and backend)
    this.refresh();
  }

  @action
  toggleShowModifiedOnly() {
    this.agendaitemsController.showModifiedOnly = !this.agendaitemsController.showModifiedOnly;
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
