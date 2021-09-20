import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';

export default class AgendaRoute extends Route {
  @service sessionService;
  @service('session') simpleAuthSession;
  @service agendaService;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const meetingId = params.meeting_id;
    // TODO KAS-2452 this include and reload true does not pick up the agenda deletion change
    // TODO KAS-2452 RETEST, its possible I tested this during cache issues
    const meeting = await this.store.queryOne('meeting', {
      'filter[id]': meetingId,
      include: 'agendas,agendas.status'
    });
    // const meeting = await this.store.findRecord('meeting', meetingId, {
    //   include: 'agendas,agendas.status', reload: true,
    // });
    set(this.sessionService, 'currentSession', meeting);
    // const agendaId = params.agenda_id;
    const agenda = await this.store.queryOne('agenda', {
      'filter[created-for][:id:]': meetingId,
      'filter[id]': params.agenda_id,
      include: 'status',
    });
    const reverseSortedAgendas = await this.store.query('agenda', {
      'filter[created-for][:id:]': meetingId,
      sort: '-serialnumber',
      include: 'status', reload: true,
    });
    // const agendas = await meeting.get('agendas');
    // const agenda = await agendas.findBy('id', agendaId);
    set(this.sessionService, 'currentAgenda', agenda);

    await this.updateSelectedAgenda(meeting, agenda);
    return {
      meeting,
      agenda,
      reverseSortedAgendas,
    };
  }

  async updateSelectedAgenda(meeting, agenda) {
    set(this.agendaService, 'addedAgendaitems', []);
    set(this.agendaService, 'addedPieces', []);
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
