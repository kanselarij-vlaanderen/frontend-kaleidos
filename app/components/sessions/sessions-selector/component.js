import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
	store: inject(),
	classNames: ["files--header-tile", "files--search"],
	tagName: "div",

	sessions: null,
	currentSession: null,
	selectedAgenda: null,
	creatingNewSession: null,

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		return this.store.query('session', {
			filter: {
				plannedstart: `${searchValue}`
			}
		});
	}),

	chooseSession: async function (session) {
		let currentSession = await this.store.findRecord('session', session.id, {
			include: "agendas",
		});
		this.set("currentSession", currentSession);
		return await this.setCurrentAgenda();
	},

	async setCurrentAgenda() {
		let agendas = await this.get('currentSession.agendas');
		this.set('selectedAgenda', agendas.get('firstObject'));
		let agendaID = this.get('selectedAgenda.id');
		this.set('selectedAgendaItems', this.store.findRecord('agendaitem', agendaID , {
			filter: {
				include:"comments"
		}}))
	},

	didInsertElement: async function () {
		this._super(...arguments);
		return await this.setCurrentAgenda();
	},

	actions: {
		async chooseSession(session) {
			return await this.chooseSession(session);
		},

		resetValue(param) {
			if (param == "") {
				this.set('sessions',  this.store.query('session',{ query: {
					filter: {
						':gte:plannedstart': new Date().toISOString()
					}
				}}));
			}
		},

		createNewSession() {
			this.set('creatingNewSession', true);
		},
	}
});
