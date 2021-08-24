import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AgendaRoute extends Route {
  @service sessionService;
  @service('session') simpleAuthSession;
  @service agendaService;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const meetingId = params.meeting_id;
    const meeting = await this.store.findRecord('meeting', meetingId, {
      include: 'agendas,agendas.status', reload: true,
    });
    this.set('sessionService.currentSession', meeting);
    const agendaId = params.agenda_id;
    // TODO KAS-2452 this hasMany reload is an addition, do we always want this?
    const agendas = await meeting.hasMany('agendas').reload();
    const agenda = await agendas.findBy('id', agendaId);
    this.set('sessionService.currentAgenda', agenda);

    await this.updateSelectedAgenda(meeting, agenda);
    return {
      meeting,
      agenda,
    };
  }

  async updateSelectedAgenda(meeting, agenda) {
    this.set('agendaService.addedAgendaitems', []);
    this.set('agendaService.addedPieces', []);
    const previousAgenda = await this.sessionService.findPreviousAgendaOfSession(meeting, agenda);
    if (previousAgenda) {
      await this.agendaService.agendaWithChanges(agenda.get('id'), previousAgenda.get('id'));
    }
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
