import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaRoute extends Route {
  @service('session') simpleAuthSession;
  @service agendaService;
  @service router;
  @service store;
  @service throttledLoadingService;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);
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
    const reverseSortedAgendas = await this.store.queryAll('agenda', {
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

    // Load agendaitem pieces
    await Promise.all(
      agendaitems.map(this.throttledLoadingService.loadPieces.perform)
    );

    return {
      meeting,
      agenda,
      reverseSortedAgendas,
      notas,
      announcements,
    };
  }

  async afterModel(model) {
    await this.loadChangesToAgenda(model.agenda);
  }

  redirect(_model, transition) {
    if (transition.to.name === 'agenda.index') {
      this.router.transitionTo('agenda.agendaitems')
    }
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
