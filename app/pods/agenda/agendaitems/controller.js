import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import search from 'frontend-kaleidos/utils/mu-search';
import { task } from 'ember-concurrency-decorators';
import { setAgendaitemsPriority } from 'frontend-kaleidos/utils/agendaitem-utils';
import { animationFrame } from 'ember-concurrency';

export default class AgendaAgendaitemsController extends Controller {
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

  @tracked filter;
  @tracked showModifiedOnly;

  @tracked meeting;
  @tracked agenda;
  @tracked previousAgenda;
  @tracked filteredNotas;
  @tracked filteredAnnouncements;

  constructor() {
    super(...arguments);
    this.filteredNotas = A();
    this.filteredAnnouncements = A();
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
    yield animationFrame();
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
        ':phrase_prefix:title,shortTitle': `${this.filter}`,
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
  *assignNewPriorities(reorderedAgendaitems, draggedAgendaItem) {
    // reorderedAgendaitems includes all items on the whole page. We only want to re-order within one category (nota/announcement/...)
    const reorderedAgendaitemsOfCategory = reorderedAgendaitems.filter((item) => item.showAsRemark === draggedAgendaItem.showAsRemark);
    yield setAgendaitemsPriority(reorderedAgendaitemsOfCategory, true, true); // permissions guarded in template (and backend)
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
