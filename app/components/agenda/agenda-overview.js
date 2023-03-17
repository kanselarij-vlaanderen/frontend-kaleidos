import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { action } from '@ember/object';
export default class AgendaOverview extends Component {
  /**
   * @argument notaGroups: Array of AgendaitemGroup-objects
   * @argument isLoadingNotaGroups: boolean indicating whether to show the loading state for nota's
   * @argument announcements: Array of agendaitems with type announcements
   * @argument newItems: items to be marked as "new on this agenda"
   * @argument meeting: the meeting that is currently open
   * @argument currentAgenda: the agenda that is currently open
   * @argument previousAgenda: the previous version of the currently open agenda
   * @argument onReorderAgendaitems: trigger the parent's action when we reorder agendaitems
   * @argument showModifiedOnly: if we should filter only on modified agendaitems
   * @argument toggleShowModifiedOnly: toggle the parent to set the modified filter on or off
   * @argument isEditingOverview {Boolean} If the overview is in edit mode
   * @argument toggleIsEditingOverview {Function} Function to call to toggle editing state
   */

  @service currentSession;

  get canEdit() {
    return this.currentSession.may('manage-agendaitems') && this.args.currentAgenda.status.get('isDesignAgenda');
  }

  get canMoveAgendaitems() {
    return this.canEdit && this.args.isEditingOverview && !this.args.showModifiedOnly;
  }

  @action
  async move(agendaitem, offset) {
    const changedAgendaItemType = await agendaitem.type;
    let agendaitemIndex = -1;
    let itemArray = [];
    if (changedAgendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
      for (const notaGroup of this.args.notaGroups) {
        if (notaGroup.agendaitems) {
          for (const nota of notaGroup.agendaitems) {
            itemArray.push(nota);
          }
        }
      }
    } else if (changedAgendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
      itemArray = [...this.args.announcements];
    }
    for (let i = 0; i < itemArray.length; i++) {
      if (itemArray[i].id === agendaitem.id) {
        agendaitemIndex = i;
        break;
      }
    }
    if (agendaitemIndex > -1 && 
      agendaitemIndex + offset > -1 &&
      agendaitemIndex + offset < itemArray.length) {
        itemArray[agendaitemIndex] = itemArray.splice(agendaitemIndex + offset, 1, itemArray[agendaitemIndex])[0];
      }
      this.args.onReorderAgendaitems(itemArray, agendaitem);
  }
}
