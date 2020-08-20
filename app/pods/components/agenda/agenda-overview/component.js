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

  selectedAgendaItem = alias('sessionService.selectedAgendaItem');

  dragHandleClass = '.vlc-agenda-items__sub-item';

  agendaitems = null;

  isEditingOverview = null;

  isShowingChanges = null;

  overviewEnabled = null;

  showLoader = null;

  @computed('selectedAgendaItem')
  get getClassNames() {
    if (this.get('selectedAgendaItem')) {
      return 'vlc-agenda-items--small';
    }
    return 'vl-u-spacer-extended-l vlc-agenda-items--spaced';
  }

  @restartableTask
  reAssignPriorities = function *(agendaitems) {
    yield agendaitems.map(async(agendaitem) => {
      if (isPresent(agendaitem.changedAttributes().priority)) {
        this.set('showLoader', true);
        await agendaitem.save();
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
  reorderItems(agendaitems) {
    if (this.currentSessionService.isEditor || this.currentAgenda.isDesignAgenda) {
      agendaitems.map((agendaitem, index) => {
        agendaitem.set('priority', index + 1);
        return agendaitem;
      });
      this.reAssignPriorities.perform(agendaitems);
      this.agendaService.groupAgendaItemsOnGroupName(agendaitems);
    }
  }

  @action
  reorderAnnouncements(agendaitems) {
    if (this.currentSessionService.isEditor || this.currentAgenda.isDesignAgenda) {
      agendaitems.map((agendaitem, index) => {
        agendaitem.set('priority', index + 1);
        return agendaitem;
      });
      this.reAssignPriorities.perform(agendaitems);
      // this.refresh();
      this.set('announcements', agendaitems);
    }
  }
}
