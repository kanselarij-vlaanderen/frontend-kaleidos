import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
	store: inject(),
	classNames: ["files--header-tile", "files--search"],
	tagName: "div",

	sessions: null,
	currentSession: null,
	creatingNewSession: null,

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		return this.store.query('session', {
			filter: {
				plannedstart: `${searchValue}`
			}
		});
	}),

	actions: {
		chooseSession(session) {
			this.chooseSession(session);
		},

		async addAgendaToSession(currentSession) {
			let agendaLength = currentSession.agendas.length;
			let agenda = this.store.createRecord('agenda', {
				name: "Ontwerp agenda " + (agendaLength + 1),
				session: currentSession
			})
			await	agenda.save();
		},

		resetValue(param) {
			if (param == "") {
				this.set('sessions', this.store.query('session', {
					filter: {
						':gte:plannedstart': new Date().toISOString()
					}
				}));
			}
		},

		createNewSession() {
			this.set('creatingNewSession', true);
		},
	}
});
