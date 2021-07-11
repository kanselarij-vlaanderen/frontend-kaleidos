import AgendaSidebar from 'frontend-kaleidos/components/agenda/agenda-detail/sidebar';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AgendaOverview extends AgendaSidebar {
  /**
   * @argument notaGroups: Array of AgendaitemGroup-objects
   * @argument isLoadingNotaGroups: boolean indicating whether to show the loading state for nota's
   * @argument announcements
   * @argument newItems: items to be marked as "new on this agenda"
   * @argument currentAgenda
   * @argument previousAgenda
   */
  @service('current-session') currentSessionService;

  dragHandleClass = '.ki-drag-handle-2';

  @tracked isEditingOverview = null;

  get isDraggingEnabled() {
    return this.currentSessionService.isEditor && this.isDesignAgenda;
  }

  @action
  toggleIsEditingOverview() {
    this.isEditingOverview = !this.isEditingOverview;
  }
}
