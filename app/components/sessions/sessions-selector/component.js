import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
	store: inject(),
	currentSession: null, 	

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		return this.store.query('meeting', {
			filter: {
				plannedStart: `${searchValue}`
			}
		});
	}),

	actions: {
		chooseSession(session) {
			this.chooseSession(session);
		},

		resetValueIfEmpty(param) {
			if (param == "") {
				this.set('sessions', this.store.query('meeting', {}));
			}
		},
	},

	async didInsertElement() {
		this._super(...arguments);
		await this.loadSessions();
	},

	async loadSessions() {
		let sessions = await this.store.query('meeting', {
			// filter: {
			// 	':gt:plannedStart': "",
			// },
			sort: "number"
		});
		this.set('sessions', sessions);
	},
});
