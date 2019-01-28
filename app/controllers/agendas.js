import Controller from '@ember/controller';
import { computed, observer } from '@ember/object';

export default Controller.extend({
	agendaMenuOpened: true,
	creatingNewSession: false,
	currentSession: null, 

	agendas: computed('currentSession', function() {
		if(!this.currentSession) return [];
		return this.store.query('agenda', {
					filter: {
						session: { id: this.currentSession.id }
					},
					sort: '-name'
				});
	}),

	modelObserver: observer('agendas', async function() {
		let agendas = await this.get('agendas');
		if(agendas && agendas.length > 0) {
			this.transitionToRoute('agendas.agenda', agendas.get('firstObject').id)
		}
	}),

	actions: {
		chooseSession(session) {
			this.set('currentSession', session);
		},

		compareAgendas() {
			this.transitionToRoute('comparison', this.get('currentSession').id);
		},

		collapseSideMenu() {
			this.set('agendaMenuOpened', !this.get('agendaMenuOpened'));
		},

		navigateBack(sessionId) {
      this.fetchNewModel();
      this.transitionToRoute('agendas.agenda', sessionId);
		},
		
		fetchNewModel() {
			let sessions = this.store.query('session', {
				filter: {
					':gt:plannedstart': ""
				},
				sort: "number"
			});
	
			this.set('model', sessions);
			this.set('currentSession', sessions.get('firstObject'));
		}

	}
});
