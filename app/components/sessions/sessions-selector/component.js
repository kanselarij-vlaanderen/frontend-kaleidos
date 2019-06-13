import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	currentSession: null,

	sortedSessions: computed.sort('sessions', function (a, b) {
		if (a.plannedStart > b.plannedStart) {
			return 1;
		} else if (a.plannedStart < b.plannedStart) {
			return -1;
		}
		return 0;
	}),

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
				this.set('sessions', this.store.findAll('meeting'));
			}
		},
	},

	async didInsertElement() {
		this._super(...arguments);
		await this.loadSessions();
	},

	async loadSessions() {
		const sessions = await this.store.findAll('meeting');
		this.set('sessions', sessions);
	},
});
