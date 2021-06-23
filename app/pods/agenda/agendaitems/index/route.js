import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { animationFrame } from 'ember-concurrency';

export default class AgendaItemsAgendaRoute extends Route {
  queryParams = {
    anchor: {
      refreshModel: false,
    },
  };

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
        'created', // Fallback sorting pieces per agendaitem
        'confidential' // Display lock icon on document-badge
      ].join(','),
      'fields[document-containers]': '',
      'page[size]': CONSTANTS.MAX_PAGE_SIZES.AGENDAITEMS,
      sort: 'show-as-remark,priority',
    });

    const parentModel = this.modelFor('agenda.agendaitems');
    const notas = agendaitems.filter((item) => parentModel.notas.includes(item));
    const announcements = agendaitems.filter((item) => parentModel.announcements.includes(item));
    const newItems = agendaitems.filter((item) => parentModel.newItems.includes(item));

    return hash({
      notas,
      announcements,
      newItems,
    });
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const {
      agenda,
      meeting,
    } = this.modelFor('agenda');
    controller.meeting = meeting;
    controller.agenda = agenda;
    controller.previousAgenda = await agenda.previousVersion;
    await controller.groupNotasOnGroupName.perform(model.notas);
    await animationFrame(); // make sure rendering has happened before trying to scroll
    controller.scrollToAnchor();
  }
}
