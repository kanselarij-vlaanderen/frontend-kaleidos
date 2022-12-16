import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class AgendaOverview extends Component {
  /**
   * @argument notaGroups: Array of AgendaitemGroup-objects
   * @argument isLoadingNotaGroups: boolean indicating whether to show the loading state for nota's
   * @argument announcements: Array of agendaitems with type announcements
   * @argument newItems: items to be marked as "new on this agenda"
   * @argument meeting: the meeting that is currently open
   * @argument currentAgenda: the agenda that is currently open
   * @argument previousAgenda: the previous version of the currently open agenda
   * @argument onReorderAgendaitems: trigger the parent's action when we reorder agendaitems (by dragging)
   * @argument showModifiedOnly: if we should filter only on modified agendaitems
   * @argument toggleShowModifiedOnly: toggle the parent to set the modified filter on or off
   * @argument isEditingOverview {Boolean} If the overview is in edit mode
   * @argument toggleIsEditingOverview {Function} Function to call to toggle editing state
   */

  @service currentSession;

  get canEdit() {
    return this.currentSession.may('manage-agendaitems') && this.args.currentAgenda.status.get('isDesignAgenda');
  }

  get canDragAgendaitems() {
    return this.canEdit && this.args.isEditingOverview;
  }
}
