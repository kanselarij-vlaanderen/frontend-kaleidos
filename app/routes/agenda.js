import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  sessionService: inject(),
  router: inject(),

  async model(params) {
    const meetingId = params.meeting_id;
    const meeting = await this.store.findRecord('meeting', meetingId, { include: 'agendas', reload: true });
    this.set('sessionService.selectedAgendaItem', null);
    this.set('sessionService.currentSession', meeting);
    const agendaId = params.agenda_id;
    const agenda = await meeting.get('agendas').findBy('id', agendaId);
    this.set('sessionService.currentAgenda', agenda);
    return {
      meeting,
      agenda
    };
  },

  actions: {
    refresh() {
      this.refresh();
    }
  }
});
