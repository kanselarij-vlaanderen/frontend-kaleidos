import Component from '@ember/component';
import {
  computed, action
} from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { setAgendaItemsPriority } from 'fe-redpencil/utils/agenda-item-utils';

export default class AgendaOverview extends Component {
  @service sessionService;

  @service agendaService;

  @service('current-session') currentSessionService;

  classNames = ['vlc-agenda-items'];

  classNameBindings = ['getClassNames'];

  selectedAgendaItem = alias('sessionService.selectedAgendaItem');

  dragHandleClass = '.vlc-agenda-items__sub-item';

  agendaitems = null;
  currentAgenda = null;

  isEditingOverview = null;

  isShowingChanges = null;

  showLoader = null;

  @computed('selectedAgendaItem')
  get getClassNames() {
    if (this.get('selectedAgendaItem')) {
      return 'vlc-agenda-items--small';
    }
    return 'vl-u-spacer-extended-l vlc-agenda-items--spaced';
  }

  @action
  selectAgendaItemAction(agendaitem) {
    this.selectAgendaItem(agendaitem);
  }

  @action
  async setFormallyOkAction(agendaItem, formallyOkUri) {
    this.set('showLoader', true);
    agendaItem.formallyOk = formallyOkUri;
    await agendaItem
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
    await setAgendaItemsPriority(itemModels, isEditor, isDesignAgenda);
    this.set('showLoader', false);
  }
}
