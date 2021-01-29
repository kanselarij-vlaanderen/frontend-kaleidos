import Controller from '@ember/controller';
import {
  computed,
  action
} from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import search from 'fe-redpencil/utils/mu-search';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';

export default class AgendaitemsAgendaController extends Controller {
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

  @tracked meeting;
  @tracked agenda;
  @tracked filteredNotas;
  @tracked filteredAnnouncements;

  @computed('filteredNotas.@each.{isDeleted}')
  get sortedNotas() {
    const actualAgendaitems = this.filteredNotas.filter((agendaitem) => !agendaitem.isDeleted);
    return this.agendaService.groupAgendaitemsOnGroupName(actualAgendaitems).then(() => actualAgendaitems);
  }

  @computed('filteredAnnouncements.@each.{isDeleted}')
  get sortedAnnouncements() {
    return this.filteredAnnouncements.filter((announcement) => !announcement.isDeleted);
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

  @task
  *filterTask() {
    if (isEmpty(this.filter)) {
      this.filteredNotas = this.model.notas;
      this.filteredAnnouncements = this.model.announcements;
    } else {
      const filter = {
        ':sqs:title,shortTitle': `${this.filter}`, // sqs can be replaced by "phrase_prefix" once a release containing https://github.com/mu-semtech/mu-search/pull/17 is available
        meetingId: this.meeting.id,
        agendaId: this.agenda.id,
      };
      const matchingIds = yield search('agendaitems', 0, 500, null, filter, (agendaitem) => agendaitem.id);
      this.filteredNotas = this.model.notas.filter((ai) => matchingIds.includes(ai.id));
      this.filteredAnnouncements = this.model.announcements.filter((ai) => matchingIds.includes(ai.id));
    }
  }

  @action
  async searchAgendaitems(value) {
    this.filter = value;
    await this.filterTask.perform();
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
