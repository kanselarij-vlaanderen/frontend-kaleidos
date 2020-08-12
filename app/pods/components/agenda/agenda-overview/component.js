import Component from '@ember/component';
import {
  computed, action
} from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency-decorators';
import { isPresent } from '@ember/utils';

export default class AgendaOverview extends Component {
  @service sessionService;

  @service agendaService;

  @service('current-session') currentSessionService;

  classNames = ['vlc-agenda-items'];

  classNameBindings = ['getClassNames'];

  selectedAgendaitem = alias('sessionService.selectedAgendaitem');

  dragHandleClass = '.vlc-agenda-items__sub-item';

  agendaitems = null;

  isEditingOverview = null;

  isShowingChanges = null;

  overviewEnabled = null;

  showLoader = null;

  @computed('selectedAgendaitem')
  get getClassNames() {
    if (this.get('selectedAgendaitem')) {
      return 'vlc-agenda-items--small';
    }
    return 'vl-u-spacer-extended-l vlc-agenda-items--spaced';
  }

  @restartableTask
  reAssignPriorities = function *(agendaitems) {
    yield agendaitems.map(async(item) => {
      if (isPresent(item.changedAttributes().priority)) {
        this.set('showLoader', true);
        await item.save();
        if (!this.isDestroyed) {
          this.set('showLoader', false);
        }
      }
    });
  };

  @action
  selectAgendaItemAction(agendaitem) {
    this.selectAgendaItem(agendaitem);
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
    if (this.currentSessionService.isEditor || this.currentAgenda.isDesignAgenda) {
      itemModels.map((item, index) => {
        item.set('priority', index + 1);
        return item;
      });
      this.reAssignPriorities.perform(itemModels);
      this.agendaService.groupAgendaitemsOnGroupName(itemModels);
    }
  }

  @action
  reorderAnnouncements(itemModels) {
    if (this.currentSessionService.isEditor || this.currentAgenda.isDesignAgenda) {
      itemModels.map((item, index) => {
        item.set('priority', index + 1);
        return item;
      });
      this.reAssignPriorities.perform(itemModels);
      // this.refresh();
      this.set('announcements', itemModels);
    }
  }
}
