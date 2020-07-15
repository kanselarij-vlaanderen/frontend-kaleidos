import Component from '@glimmer/component';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { restartableTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class AgendaSidebar extends Component {
  @service sessionService;
  @service('current-session') currentSessionService;
  @service agendaService;
  @alias('sessionService.selectedAgendaItem') selectedAgendaItem;

  @tracked announcements = this.args.announcements;
  @tracked isShowingChanges = false;

  classNames = ['vlc-agenda-items'];
  overviewEnabled = null;
  dragHandleClass = '.vlc-agenda-detail-sidebar__sub-item';

  @restartableTask
  reAssignPriorities = function* (agendaitems) {
    yield agendaitems.map(async (item) => {
      if (isPresent(item.changedAttributes().priority)) {
        return item.save();
      }
    })
  }

  @action
  selectAgendaItemAction(agendaitem) {
    this.args.selectAgendaItem(agendaitem);
  }

  @action
  toggleChangesOnly() {
    this.isShowingChanges = !this.isShowingChanges;
  }

  @action
  reorderItems(itemModels) {
    if (!this.currentSessionService.isEditor) {
      return null;
    }
    this.isReAssigningPriorities = true;
    itemModels.map((item, index) => {
      item.set('priority', index + 1);
      return item;
    });
    this.reAssignPriorities.perform(itemModels);
    this.agendaService.groupAgendaItemsOnGroupName(itemModels);
    this.isReAssigningPriorities = false;
  }

  @action
  reorderAnnouncements(itemModels) {
    if (!this.currentSessionService.isEditor) {
      return null;
    }
    this.isReAssigningPriorities = true;
    itemModels.map((item, index) => {
      item.set('priority', index + 1);
      return item;
    });
    this.reAssignPriorities.perform(itemModels);
    this.announcements = itemModels;
    this.isReAssigningPriorities = false;
  }
}
