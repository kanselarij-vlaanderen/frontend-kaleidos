import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
	agendaMenuOpened: true,
	creatingNewSession: false,
	currentSession: null, 
	currentAgendaItem: null,
	selectedAgendaItem:null,

	model: computed('currentSession', function() {
		if(!this.currentSession) return [];
		return this.store.query('agenda', {
					filter: {
						session: { id: this.currentSession.id }
					},
					sort: '-name'
				});
	}),

	currentAgenda: computed('model', function() {
		let agendas = this.get('agendas');
		if(agendas && agendas.length > 0) {
			let agendaIdToQuery = agendas.get('firstObject').id;
			return this.store.query('agenda', {
				filter: {
					id: agendaIdToQuery
				}
			})
		}
	}),

	currentAgendaItems: computed('currentAgenda', function() {
		if(this.currentAgenda) {
			return this.store.query('agendaitem', {
				filter: {
					agenda:{id: this.currentAgenda.id }
				},
				include:'subcase'
			})
		}
	}),

	actions: {
		navigateToSubCases() {
			this.transitionToRoute('agendas.agenda.subcases');
		},

		navigateBack(sessionId) {
      this.transitionToRoute('agendas.agenda', sessionId);
		},

		lockAgenda(agenda) {
			agenda.set('locked', !agenda.locked);
			agenda.save();
		}
	}
});
