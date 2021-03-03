import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class AgendaItemsAgendaRoute extends Route {
  @service sessionService;
  @service agendaService;

  async model() {
    const {
      agenda,
    } = this.modelFor('agenda');
    const agendaitems = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      include: [
        'mandatees',
        'pieces',
        'pieces.document-container' // Only needed for relationship pieces -> document-container
      ].join(','),
      'fields[mandatees]': [
        'title', // Display group header per agendaitems group
        'priority' // Sorting agendaitems on minister protocol order
      ].join(','),
      'fields[pieces]': [
        'name', // Display and sorting pieces per agendaitem
        'document-container', // Deduplicating multiple pieces per container
        'created' // Fallback sorting pieces per agendaitem
      ].join(','),
      'fields[document-containers]': '',
      'page[size]': CONFIG.MAX_PAGE_SIZE.AGENDAITEMS,
      sort: 'show-as-remark,priority',
    });

    const parentModel = this.modelFor('agenda.agendaitems');
    const notas = agendaitems.filter((item) => parentModel.notas.includes(item));
    const announcements = agendaitems.filter((item) => parentModel.announcements.includes(item));

    this.set('sessionService.selectedAgendaitem', null);

    return hash({
      notas,
      announcements,
    });
  }

  async setupController(controller) {
    super.setupController(...arguments);
    const {
      agenda,
      meeting,
    } = this.modelFor('agenda');
    controller.meeting = meeting;
    controller.agenda = agenda;
    controller.previousAgenda = await agenda.previousVersion;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
