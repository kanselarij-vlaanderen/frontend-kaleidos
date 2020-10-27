import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  sessionService: inject(),
  agendaService: inject(),
  router: inject(),

  async model(params) {
    const meetingId = params.meeting_id;
    const meeting = await this.store.findRecord('meeting', meetingId, {
      include: 'agendas,agendas.status', reload: true,
    });
    this.set('sessionService.selectedAgendaitem', null);
    this.set('sessionService.currentSession', meeting);
    const agendaId = params.agenda_id;
    const agenda = await meeting.get('agendas').findBy('id', agendaId);
    this.set('sessionService.currentAgenda', agenda);

    await this.updateSelectedAgenda(meeting, agenda);
    return {
      meeting,
      agenda,
    };
  },

  async updateSelectedAgenda(meeting, agenda) {
    this.set('agendaService.addedAgendaitems', []);
    this.set('agendaService.addedPieces', []);
    const previousAgenda = await this.sessionService.findPreviousAgendaOfSession(meeting, agenda);
    if (previousAgenda) {
      await this.agendaService.agendaWithChanges(agenda.get('id'), previousAgenda.get('id'));
    }
  },

  actions: {
    reloadModel() {
      this.refresh();
    },
  },
});
