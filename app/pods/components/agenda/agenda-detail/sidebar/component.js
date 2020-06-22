import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';
import { isPresent } from '@ember/utils';
import {restartableTask} from "ember-concurrency-decorators";

export default class AgendaSidebar extends Component{
  @inject sessionService;
  @inject('current-session') currentSessionService;
  @inject agendaService;
  @alias('sessionService.selectedAgendaItem') selectedAgendaItem;
  classNames = ['vlc-agenda-items'];
  classNameBindings = ['getClassNames'];

  agendaitems = null;
  isShowingChanges = null;
  overviewEnabled = null;
  isReAssigningPriorities = null;
  dragHandleClass = '.vlc-agenda-detail-sidebar__sub-item';

  @computed('selectedAgendaItem')
  get getClassNames () {
    if (this.selectedAgendaItem) {
      return 'vlc-agenda-items--small';
    } else {
      return 'vl-u-spacer-extended-l vlc-agenda-items--spaced';
    }
  }

  @restartableTask
  reAssignPriorities = function* (agendaitems) {
    yield agendaitems.map(async (item) => {
      if (isPresent(item.changedAttributes().priority)) {
        return item.save();
      }
    })
  }

  @action
  selectAgendaItemAction(agendaitem){
    this.selectAgendaItem(agendaitem);
  }
  @action
  toggleChangesOnly() {
    this.toggleProperty('isShowingChanges');
  }

  @action
  reorderItems(itemModels) {
    if (!this.currentSessionService.isEditor) {
      return;
    }
    itemModels.map((item, index) => {
      item.set('priority', index + 1);
    });
    this.reAssignPriorities.perform(itemModels);
    this.agendaService.groupAgendaItemsOnGroupName(itemModels);
  }

  @action
  reorderAnnouncements(itemModels) {
    if (!this.currentSessionService.isEditor) {
      return;
    }
    itemModels.map((item, index) => {
      item.set('priority', index + 1);
    });
    this.reAssignPriorities.perform(itemModels);
    this.set('announcements', itemModels);
  }
}
