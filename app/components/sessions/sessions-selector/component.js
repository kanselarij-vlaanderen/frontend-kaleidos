import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
	store: inject(),
	currentSession: null, 	

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

		resetValueIfEmpty(param) {
			if (param == "") {
				this.set('sessions', this.store.query('session'));
			}
		},
	},

	async didInsertElement() {
		this._super(...arguments);
		await this.loadSessions();
	},

	async loadSessions() {
		let sessions = await this.store.query('session', {
			filter: {
				':gt:plannedstart': "",
			},
			sort: "number"
		});
		this.set('sessions', sessions);
	},
});
