import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

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
		return this.store.findRecord('meeting', id, { include: 'agendas' }).then((meeting) => {
			this.set('sessionService.selectedAgendaItem', null);
			this.set('sessionService.currentSession',null);
			this.set('sessionService.currentSession', meeting);
			return meeting;
		});
	},

	afterModel(model, transition) {
		const selectedAgendaId = transition.queryParams.selectedAgenda;
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
