import Service from '@ember/service';
import { computed, observer } from '@ember/object';
import { inject } from '@ember/service';

export default Service.extend({
	store:inject(),
	currentSession: null,

	agendas: computed('currentSession.agendas.@each', function() {
		let currentSession = this.get('currentSession');
		if(currentSession) {
			return this.store.query('agenda', {
				filter: {
					session: { id: currentSession.id }
				},
				sort: 'name'
			});	
		}
	}),

	currentAgendaInitialiser: observer('currentSession.agendas', async function() {
		if(this.get('currentAgenda')) return;
		let agendas = await this.get('agendas');
		if(agendas) {
			this.set('currentAgenda', agendas.get('firstObject'));
		}
	}),
	
	currentAgendaItems: computed('currentAgenda.agendaitems.@each', function() {
		let currentAgenda = this.get('currentAgenda');
		if(currentAgenda) {
			let agendaitems = this.store.query('agendaitem', {
				filter: {
					agenda: { id: currentAgenda.id }
				},
				include:'subcase',
				sort: 'priority'
			});	
			return agendaitems;
		} else {
			return [];
		}
	}),
	announcements: computed('currentAgenda.announcements.@each', function() {
		let currentAgenda = this.get('currentAgenda');
		if(currentAgenda) {
			let announcements = this.store.query('announcement', {
				filter: {
					agenda: { id: currentAgenda.id }
				},
			});
			return announcements;
		} else {
			return [];
		}
	}),
	
	definiteAgendas: computed('agendas', function() {
		return this.get('agendas').filter(agenda => agenda.name != "Ontwerpagenda")
	})
});
