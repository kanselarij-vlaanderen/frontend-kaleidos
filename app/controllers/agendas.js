import Controller from '@ember/controller';
import { computed, observer } from '@ember/object';

export default Controller.extend({
	queryParams:['sessionId', 'agendaId'],
	agendaMenuOpened: true,
	creatingNewSession: false,
	currentSession: null,
	currentAgendaItem: null,
	selectedAgendaItem: null,
	currentAgenda: null,

	currentSessionTest: observer('sessionId', async function() {
		let sessionId = await this.get('sessionId');
		if(sessionId) {
			let session = await this.store.findRecord('session', sessionId, { reload: true });
			this.set('currentSession', session);
			this.notifyPropertyChange('currentSession');
		} 
	}),

	agendasObserver: observer('currentSession', async function () {
		let currentSession = this.get('currentSession');
		if (!currentSession) return [];
		let agendas = await this.store.query('agenda', {
			filter: {
				session: { id: currentSession.id }
			},
			sort: 'name'
		});
		this.set('agendas', agendas);
	}),

	currentAgendaObserver: observer('agendas', async function () {
		let agendas = await this.get('agendas');
		let agendaQueryParam = this.get('agendaId');
		if (agendas && agendas.length > 0) {
			let agendaIdToQuery = null;

			if(agendaQueryParam) {
				agendaIdToQuery = agendaQueryParam;
			} else {
				agendaIdToQuery = agendas.get('firstObject').id;
			}

			let currentAgenda = await this.store.findRecord('agenda', agendaIdToQuery, { reload: true });

			this.set('currentAgenda', currentAgenda);
			this.notifyPropertyChange('currentAgenda');
		}
	}),

	currentAgendaItems: computed('currentAgenda', function () {
		let currentAgenda = this.get('currentAgenda');
		if (currentAgenda) {
			return this.store.query('agendaitem', {
				filter: {
					agenda: { id: currentAgenda.id }
				},
				include: 'subcase'
			})
		}
	}),

	actions: {
		navigateToSubCases() {
			this.transitionToRoute('subcases', { queryParams: { agendaId: this.get('currentAgenda.id') } });
		},

		lockAgenda(agenda) {
			agenda.set('locked', !agenda.locked);
			agenda.save();
		},

		compareAgendas() {
			this.transitionToRoute('comparison', { queryParams: { sessionId: this.get('currentSession').id } });
		},

		cancelNewSessionForm() {
			this.set('creatingNewSession', false);
		}
	}
});
