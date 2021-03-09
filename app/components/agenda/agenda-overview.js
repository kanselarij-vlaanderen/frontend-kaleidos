import AgendaSidebar from 'frontend-kaleidos/pods/components/agenda/agenda-detail/sidebar/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

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

  get isDraggingEnabled() {
    return this.currentSessionService.isEditor && this.isDesignAgenda;
  }

  @action
  toggleIsEditingOverview() {
    this.isEditingOverview = !this.isEditingOverview;
  }
}
