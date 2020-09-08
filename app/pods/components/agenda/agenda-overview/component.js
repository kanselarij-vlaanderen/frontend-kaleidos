import Component from '@ember/component';
import {
  computed, action
} from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { setAgendaitemsPriority } from 'fe-redpencil/utils/agendaitem-utils';

export default class AgendaOverview extends Component {
  @service sessionService;

  @service agendaService;

  @service('current-session') currentSessionService;

  classNames = ['vlc-agenda-items'];

  classNameBindings = ['getClassNames'];

  selectedAgendaitem = alias('sessionService.selectedAgendaitem');

  dragHandleClass = '.vlc-agenda-items__sub-item';

  agendaitems = null;
  currentAgenda = null;

  isEditingOverview = null;

  isShowingChanges = null;

  showLoader = null;

  @computed('selectedAgendaitem')
  get getClassNames() {
    if (this.get('selectedAgendaitem')) {
      return 'vlc-agenda-items--small';
    }
    return 'vl-u-spacer-extended-l vlc-agenda-items--spaced';
  }

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
  reorderItems(itemModels) {
    const isEditor = this.currentSessionService.isEditor;
    const isDesignAgenda = this.currentAgenda.isDesignAgenda;
    setAgendaitemsPriority(itemModels, isEditor, isDesignAgenda);
  }
}
