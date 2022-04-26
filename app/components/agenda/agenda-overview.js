import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AgendaOverview extends Component {
  /**
   * @argument notaGroups: Array of AgendaitemGroup-objects
   * @argument isLoadingNotaGroups: boolean indicating whether to show the loading state for nota's
   * @argument announcements: Array of agendaitems with boolean 'showAsRemark' == true
   * @argument newItems: items to be marked as "new on this agenda"
   * @argument meeting: the meeting that is currently open
   * @argument currentAgenda: the agenda that is currently open
   * @argument previousAgenda: the previous version of the currently open agenda
   * @argument onReorderAgendaitems: trigger the parent's action when we reorder agendaitems (by dragging)
   * @argument showModifiedOnly: if we should filter only on modified agendaitems
   * @argument toggleShowModifiedOnly: toggle the parent to set the modified filter on or off
   */

  @service currentSession;

  dragHandleClass = '.ki-drag-handle-2';

  get isDraggingEnabled() {
    return this.currentSession.isEditor && this.isDesignAgenda;
  }

  get isDesignAgenda() {
    return this.args.currentAgenda.isDesignAgenda;
  }

  @action
  toggleIsEditingOverview() {
    this.args.isEditingOverview = !this.args.isEditingOverview;
  }
}
