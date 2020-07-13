import Component from '@ember/component';
import { computed, action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency-decorators';
import { isPresent } from '@ember/utils';

export default class AgendaList extends Component {
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

  isReAssigningPriorities = null;

  @computed('selectedAgendaItem')
  get getClassNames() {
    if (this.get('selectedAgendaItem')) {
      return 'vlc-agenda-items--small';
    }
    return 'vl-u-spacer-extended-l vlc-agenda-items--spaced';
  }

  @restartableTask
  reAssignPriorities = function* (agendaitems) {
    yield agendaitems.map(async (item) => {
      if (isPresent(item.changedAttributes().priority)) {
        this.set('isReAssigningPriorities', true);
        await item.save();
        if (!this.isDestroyed) {
          this.set('isReAssigningPriorities', false);
        }
      }
    });
  };

  @action
  selectAgendaItemAction(agendaitem) {
    this.selectAgendaItem(agendaitem);
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
      this.agendaService.groupAgendaItemsOnGroupName(itemModels);
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
