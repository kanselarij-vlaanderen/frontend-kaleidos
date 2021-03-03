import AgendaSidebar from 'frontend-kaleidos/pods/components/agenda/agenda-detail/sidebar/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class AgendaOverview extends AgendaSidebar {
  /**
   * @argument notas
   * @argument announcements
   * @argument currentAgenda
   * @argument previousAgenda
   */
  @service sessionService;
  @service agendaService;

  @service('current-session') currentSessionService;

  dragHandleClass = '.ki-drag-handle-2';

  @tracked isEditingOverview = null;
  @tracked showLoader = null;
  @tracked isDesignAgenda;

  constructor() {
    super(...arguments);
    this.determineIfDesignAgenda.perform();
  }

  get isDraggingEnabled() {
    return this.currentSessionService.isEditor && this.isDesignAgenda;
  }

  @action
  toggleIsEditingOverview() {
    this.isEditingOverview = !this.isEditingOverview;
  }

  @task
  *determineIfDesignAgenda() {
    const agendaStatus = yield this.args.currentAgenda.status;
    this.isDesignAgenda = agendaStatus.isDesignAgenda;
  }
}
