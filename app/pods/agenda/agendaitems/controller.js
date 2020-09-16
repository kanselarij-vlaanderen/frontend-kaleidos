import Controller from '@ember/controller';
import {
  computed,
  action
} from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';

export default class AgendaItemsAgendaController extends Controller {
  queryParams = ['filter'];

  @service('-routing') routing;
  @service sessionService;
  @service agendaService;

  @alias('model.agendaitems') agendaitems;
  @alias('model.announcements') announcements;
  @alias('sessionService.selectedAgendaitem') selectedAgendaitem;
  @alias('sessionService.currentAgenda') currentAgenda;
  @alias('sessionService.currentSession') currentSession;

  @tracked filter;

  @computed('agendaitems.@each.{priority,isDeleted}')
  get sortedAgendaitems() {
    const actualAgendaitems = this.agendaitems.filter((agendaitem) => !agendaitem.showAsRemark && !agendaitem.isDeleted)
      .sortBy('priority');
    return this.agendaService.groupAgendaitemsOnGroupName(actualAgendaitems).then(() => actualAgendaitems);
  }

  @computed('announcements.@each.{priority,isDeleted}')
  get sortedAnnouncements() {
    const announcements = this.announcements;
    if (announcements) {
      return announcements.filter((announcement) => !announcement.isDeleted).sortBy('priority');
    }
    return [];
  }

  get agendaitemsClass() {
    if (this.routing.currentRouteName.startsWith('agenda.agendaitems.agendaitem')) {
      return 'vlc-panel-layout__agenda-items';
    }
    return 'vlc-panel-layout-agenda__detail vl-u-bg-porcelain';
  }

  get isOverviewWindow() {
    return this.routing.currentRouteName === 'agenda.agendaitems.index';
  }

  @action
  searchAgendaitems(value) {
    this.filter = value;
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
