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
      reload: true,
    });
    this.set('sessionService.currentSession', meeting);

    const agendaId = params.agenda_id;
    const agenda = await this.store.findRecord('agenda', agendaId, {
      reload: true,
    });
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
      await this.agendaService.agendaWithChanges(agenda.id, previousAgenda.id);
    }
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
