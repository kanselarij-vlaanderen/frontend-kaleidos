import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';
import search from 'frontend-kaleidos/utils/mu-search';

export default class AgendaAgendaitemsRoute extends Route {
  queryParams = {
    filter: {
      refreshModel: true,
    },
    showModifiedOnly: {
      refreshModel: true,
      as: 'toon_enkel_gewijzigd',
    },
  };

  @service sessionService;
  @service agendaService;

  async model(params, transition) {
    const {
      agenda,
      meeting,
    } = this.modelFor('agenda');
    console.log(params);
    if (transition.from) {
      console.log('From transition', transition.from);
    }
    let agendaitems = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      include: [
        'mandatees'
      ].join(','),
      'fields[mandatees]': [
        'title', // Display group header per agendaitems group
        'priority' // Sorting agendaitems on minister protocol order
      ].join(','),
      'page[size]': CONFIG.MAX_PAGE_SIZE.AGENDAITEMS,
      sort: 'show-as-remark,priority',
    });

    if (params.showModifiedOnly) {
      // agendaService.agendaWithChanges is called by parent route
      const matchingIds = this.agendaService.addedAgendaitems;
      agendaitems = agendaitems.filter((ai) => matchingIds.includes(ai.id));
    }

    if (params.filter) {
      const filter = {
        ':phrase_prefix:title,shortTitle': `${params.filter}`,
        meetingId: meeting.id,
        agendaId: agenda.id,
      };
      const matchingIds = await search('agendaitems', 0, 500, null, filter, (agendaitem) => agendaitem.id);
      agendaitems = agendaitems.filter((ai) => matchingIds.includes(ai.id));
    }

    const notas = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark);
    const announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark);

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
