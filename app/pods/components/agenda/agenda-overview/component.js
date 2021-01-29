import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { setAgendaitemsPriority } from 'fe-redpencil/utils/agendaitem-utils';
import { tracked } from '@glimmer/tracking';

export default class AgendaOverview extends Component {
  /**
   * @argument notas
   * @argument announcements
   * @argument currentAgenda
   */
  @service sessionService;
  @service agendaService;

  @service('current-session') currentSessionService;

  dragHandleClass = '.ki-drag-handle-2';

  @tracked isEditingOverview = null;
  @tracked isShowingChanges = null;
  @tracked showLoader = null;

  @action
  selectAgendaitemAction(agendaitem) {
    this.selectAgendaitem(agendaitem);
  }

  @action
  async setFormallyOkAction(agendaitem, formallyOkUri) {
    this.showLoader = true;
    agendaitem.formallyOk = formallyOkUri;
    await agendaitem
      .save()
      .catch(() => {
        this.toaster.error();
      })
      .finally(() => {
        this.showLoader = false;
      });
  }

  @action
  toggleIsEditingOverview() {
    this.isEditingOverview = !this.isEditingOverview;
  }

  @action
  toggleChangesOnly() {
    this.isShowingChanges = ! this.isShowingChanges;
  }

  @action
  async reorderItems(itemModels) {
    const isEditor = this.currentSessionService.isEditor;
    const isDesignAgenda = this.args.currentAgenda.isDesignAgenda;
    this.showLoader = true;
    await setAgendaitemsPriority(itemModels, isEditor, isDesignAgenda);
    this.showLoader = false;
  }
}
