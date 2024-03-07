import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import { task, all } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaRoute extends Route {
  @service('session') simpleAuthSession;
  @service throttledLoadingService;
  @service agendaService;
  @service store;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const meetingId = params.meeting_id;
    const meeting = await this.store.findRecord('meeting', meetingId, {
      reload: true,
    });
    const agendaId = params.agenda_id;
    const agenda = await this.store.findRecord('agenda', agendaId, {
      reload: true,
    });
    const reverseSortedAgendas = await this.store.query('agenda', {
      'filter[created-for][:id:]': meetingId,
      sort: '-serialnumber',
      include: 'status',
    });

    const agendaitems = await this.store.query('agendaitem', {
      filter: {
        agenda: {
          id: agenda.id,
        },
      },
      include: 'mandatees',
    });
    const notas = [];
    const announcements = [];
    for (const agendaitem of agendaitems.sortBy('number').toArray()) {
      const type = await agendaitem.type;
      if (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
        notas.push(agendaitem);
      } else {
        announcements.push(agendaitem);
      }
    }
    await this.loadDocuments.perform(agendaitems);

    return {
      meeting,
      agenda,
      reverseSortedAgendas,
      notas,
      announcements,
    };
  }

  @task
  *loadDocuments(agendaitems) {
    yield all(
      agendaitems.map(async (agendaitem) => {
        await this.throttledLoadingService.loadPieces.perform(agendaitem);
      })
    );
  }

  async afterModel(model) {
    await this.loadChangesToAgenda(model.agenda);
  }

  async loadChangesToAgenda(agenda) {
    set(this.agendaService, 'addedAgendaitems', []);
    set(this.agendaService, 'addedPieces', []);
    const previousAgenda = await agenda.previousVersion;
    if (previousAgenda) {
      await this.agendaService.agendaWithChanges(
        agenda.get('id'),
        previousAgenda.get('id')
      );
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.isLoading = false;
  }
}
