import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';

export default class AgendaItemsAgendaRoute extends Route {
  queryParams = {
    filter: {
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
        'created' // Fallback sorting pieces per agendaitem
      ].join(','),
      'fields[document-containers]': '',
      'page[size]': CONFIG.MAX_PAGE_SIZE.AGENDAITEMS,
      sort: 'show-as-remark,priority',
    });

    const notas = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark);
    const announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark);

    this.set('sessionService.selectedAgendaitem', null);

    return hash({
      notas,
      announcements,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    const {
      agenda,
      meeting,
    } = this.modelFor('agenda');
    controller.meeting = meeting;
    controller.agenda = agenda;
    // Initialize filteredNotas and filteredAnnouncements on controller
    controller.filterTask.perform();
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
