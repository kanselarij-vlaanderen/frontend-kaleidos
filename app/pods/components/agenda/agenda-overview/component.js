import Component from '@ember/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { setAgendaitemsPriority } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class AgendaOverview extends Component {
  @service sessionService;

  @service agendaService;

  @service('current-session') currentSessionService;

  classNames = ['vlc-agenda-items', 'auk-u-m-8', 'vlc-agenda-items--spaced'];

  dragHandleClass = '.ki-drag-handle-2';

  agendaitems = null;
  currentAgenda = null;

  isEditingOverview = null;

  isShowingChanges = null;

  showLoader = null;

  @action
  selectAgendaitemAction(agendaitem) {
    this.selectAgendaitem(agendaitem);
  }

  @action
  async setFormallyOkAction(agendaitem, formallyOkUri) {
    this.set('showLoader', true);
    agendaitem.formallyOk = formallyOkUri;
    await agendaitem
      .save()
      .catch(() => {
        this.toaster.error();
      })
      .finally(() => {
        this.set('showLoader', false);
      });
  }

  @action
  toggleIsEditingOverview() {
    this.toggleProperty('isEditingOverview');
  }

  @action
  toggleChangesOnly() {
    this.toggleProperty('isShowingChanges');
  }

  @action
  async reorderItems(itemModels) {
    const isEditor = this.currentSessionService.isEditor;
    const isDesignAgenda = this.currentAgenda.isDesignAgenda;
    this.set('showLoader', true);
    await setAgendaitemsPriority(itemModels, isEditor, isDesignAgenda);
    this.set('showLoader', false);
  }
}
