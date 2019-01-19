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

		// async createAgendaItem(agenda) {
		// 	let agendaItem = {
		// 		priority: 2,
		// 		orderAdded: 3,
		// 		extended: true,
		// 		dateAdded: new Date().toISOString(),
		// 		agenda: agenda
		// 	};

		// 	let item = this.store.createRecord('agendaitem', agendaItem);
		// 	await item.save();
		// },

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

		// addSubCasesToAgenda() {
		// 	this.set('addingSubCasesToAgenda', true);
		// }
	}
});
