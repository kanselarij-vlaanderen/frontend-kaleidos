import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { setAgendaitemsPriority } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class AgendaOverview extends Component {
  @service sessionService;

  @service agendaService;

  @service('current-session') currentSessionService;

  dragHandleClass = '.ki-drag-handle-2';

  @tracked isEditingOverview = false;

  @tracked isShowingChanges = false;

  @tracked showLoader = null;

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
    this.isShowingChanges = !this.isShowingChanges;
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
