import Controller from '@ember/controller';
import { computed, observer } from '@ember/object';

export default Controller.extend({
	agendaMenuOpened: true,
	creatingNewSession: false,
	currentSession: null,
	currentAgendaItem: null,
	selectedAgendaItem: null,
	currentAgenda: null,

	model: computed('currentSession', function () {
		if (!this.currentSession) return [];
		return this.store.query('agenda', {
			filter: {
				session: { id: this.currentSession.id }
			},
			sort: '-name'
		});
	}),

	currentAgendaObserver: observer('model', async function () {
		let agendas = await this.get('model');
		if (agendas && agendas.length > 0) {
			let agendaIdToQuery = agendas.get('firstObject').id;
			// add reload:true to force refresh
			let currentAgenda = await this.store.findRecord('agenda', agendaIdToQuery, { reload: true });
			this.set('currentAgenda', currentAgenda);
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

		navigateBack(sessionId) {
			this.transitionToRoute('agendas.agenda', sessionId);
		},

		lockAgenda(agenda) {
			agenda.set('locked', !agenda.locked);
			agenda.save();
		},

		compareAgendas() {
			this.transitionToRoute('comparison', { queryParams: { sessionId: this.get('currentSession').id } });
		}
	}
});
