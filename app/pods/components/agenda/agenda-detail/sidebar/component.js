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
  reAssignPriorities = function *(agendaitems) {
    yield agendaitems.map(async(agendaitem) => {
      if (isPresent(agendaitem.changedAttributes().priority)) {
        return agendaitem.save();
      }
    });
  };

  @action
  selectAgendaItemAction(agendaitem) {
    this.args.selectAgendaItem(agendaitem);
  }

  @action
  toggleChangesOnly() {
    this.isShowingChanges = !this.isShowingChanges;
  }

  @action
  reorderItems(agendaitems) {
    if (!this.currentSessionService.isEditor) {
      return null;
    }
    this.isReAssigningPriorities = true;
    agendaitems.map((agendaitem, index) => {
      agendaitem.set('priority', index + 1);
      return agendaitem;
    });
    this.reAssignPriorities.perform(agendaitems);
    this.agendaService.groupAgendaItemsOnGroupName(agendaitems);
    this.isReAssigningPriorities = false;
  }

  @action
  reorderAnnouncements(agendaitems) {
    if (!this.currentSessionService.isEditor) {
      return null;
    }
    this.isReAssigningPriorities = true;
    agendaitems.map((agendaitem, index) => {
      agendaitem.set('priority', index + 1);
      return agendaitem;
    });
    this.reAssignPriorities.perform(agendaitems);
    this.announcements = agendaitems;
    this.isReAssigningPriorities = false;
  }
}
