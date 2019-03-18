import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default Route.extend({
	sessionService: inject(),

	queryParams: {
    selectedAgenda: {
      refreshModel: true
    }
	},
	
	model(params) {
		const id = params.id;
		return this.store.findRecord('meeting', id, { include: 'agendas' }).then((meeting) => {
			this.set('sessionService.currentSession', meeting);
			return meeting;
		});
	},

	afterModel(model, transition) {
		const selectedAgendaId = transition.queryParams.selectedAgenda;
		return this.get('sessionService.agendas').then(agendas => {
			if(selectedAgendaId) {
				const selectedAgenda = agendas.find((agenda) => agenda.id === selectedAgendaId);
				if(selectedAgenda) {
					this.set('sessionService.currentAgenda', selectedAgenda);
				}
			} else {
				this.set('sessionService.currentAgenda', agendas.get('firstObject'));
			}
		});
	}
});
