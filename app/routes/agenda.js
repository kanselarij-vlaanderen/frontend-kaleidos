import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';

export default class AgendaRoute extends Route {
  @service('session') simpleAuthSession;
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

    return {
      meeting,
      agenda,
      reverseSortedAgendas,
    };
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
