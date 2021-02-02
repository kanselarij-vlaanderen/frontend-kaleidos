import Controller from '@ember/controller';
import {
  computed,
  action
} from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import search from 'fe-redpencil/utils/mu-search';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';
import { setAgendaitemsPriority } from 'fe-redpencil/utils/agendaitem-utils';

export default class AgendaitemsAgendaController extends Controller {
  queryParams = [{
    filter: {
      type: 'string',
    },
    showModifiedOnly: {
      type: 'boolean',
    },
  }];

  @service('-routing') routing;
  @service sessionService;
  @service agendaService;

  @alias('model.agendaitems') agendaitems;
  @alias('model.announcements') announcements;
  @alias('sessionService.currentAgenda') currentAgenda;
  @alias('sessionService.currentSession') currentSession;

  @tracked filter;
  @tracked showModifiedOnly;

  @tracked meeting;
  @tracked agenda;
  @tracked filteredNotas;
  @tracked filteredAnnouncements;

  constructor() {
    super(...arguments);
    this.filteredNotas = A();
    this.filteredAnnouncements = A();
  }

  @computed('filteredNotas.@each.{isDeleted}')
  get sortedNotas() {
    return this.filteredNotas.filter((agendaitem) => !agendaitem.isDeleted);
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
    let filteredNotas = this.model.notas;
    let filteredAnnouncements = this.model.announcements;

    if (this.showModifiedOnly) {
      // agendaService.agendaWithChanges is called by parent route
      const matchingIds = this.agendaService.addedAgendaitems;
      filteredNotas = filteredNotas.filter((ai) => matchingIds.includes(ai.id));
      filteredAnnouncements = filteredAnnouncements.filter((ai) => matchingIds.includes(ai.id));
    }

    if (this.filter) {
      const filter = {
        ':sqs:title,shortTitle': `${this.filter}`, // sqs can be replaced by "phrase_prefix" once a release containing https://github.com/mu-semtech/mu-search/pull/17 is available
        meetingId: this.meeting.id,
        agendaId: this.agenda.id,
      };
      const matchingIds = yield search('agendaitems', 0, 500, null, filter, (agendaitem) => agendaitem.id);
      filteredNotas = filteredNotas.filter((ai) => matchingIds.includes(ai.id));
      filteredAnnouncements = filteredAnnouncements.filter((ai) => matchingIds.includes(ai.id));
    }

    this.filteredNotas = filteredNotas;
    this.filteredAnnouncements = filteredAnnouncements;
  }

  @action
  async searchAgendaitems(value) {
    this.filter = value;
    await this.filterTask.perform();
  }

  @task
  *assignNewPriorities(reorderedAgendaitems) {
    yield setAgendaitemsPriority(reorderedAgendaitems, true, true); // permissions guarded in template (and backend)
    this.refresh();
  }

  @action
  toggleShowModifiedOnly() {
    this.showModifiedOnly = !this.showModifiedOnly;
    this.filterTask.perform();
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
