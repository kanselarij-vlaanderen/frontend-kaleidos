import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all } from 'rsvp';

export default Route.extend(AuthenticatedRouteMixin, {
  authenticationRoute: 'login',
  sessionService: inject(),
  router: inject(),

  queryParams: {
    selectedAgenda: {
      refreshModel: true
    }
  },

  model(params) {
    const id = params.id;
    return this.store.findRecord('meeting', id, { include: 'agendas' }).then(async (meeting) => {
      this.set('sessionService.selectedAgendaItem', null);
      this.set('sessionService.currentSession', null);
      this.set('sessionService.currentSession', meeting);
      await all(meeting.get('agendas').map((agenda) => {
        return agenda.load('status');
      }));

      return meeting;
    });
  },

  afterModel() {
    const { selectedAgenda: selectedAgendaId } = this.paramsFor('agenda');

    return this.get('sessionService.agendas').then(agendas => {
      if (selectedAgendaId) {
        const selectedAgenda = agendas.find((agenda) => agenda.id === selectedAgendaId);
        if (selectedAgenda) {
          this.set('sessionService.currentAgenda', selectedAgenda);
        }
      } else {
        this.set('sessionService.currentAgenda', agendas.get('firstObject'));
      }
    });
  },

  actions: {
    refresh() {
      this.refresh();
    }
  }
});
