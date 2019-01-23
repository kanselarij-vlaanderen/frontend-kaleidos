import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

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

		async lockAgenda(session) {
			let agendas = await this.store.query('agenda', {
				filter: {
					session: { id: session.id }
				},
				sort: '-name'
			});
			let agendaToLock = agendas.get('firstObject');
			agendaToLock.set('locked', true);

			agendaToLock.save().then(async () => {
				return await this.addAgendaToSession(session, agendaToLock);
			})
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
		}
	},

	addAgendaToSession(currentSession, agenda) {
		let agendaItems = agenda.get('agendaitems');
		let agendaLength = currentSession.agendas.length;
		let newAgenda = this.store.createRecord('agenda', {
			name: "Ontwerpagenda " + alphabet[agendaLength].toUpperCase(),
			session: currentSession
		})
		newAgenda.save().then(agenda => {
			agendaItems.forEach(async agendaitem => {
				let agendaItemToSave = this.store.createRecord('agendaitem', {
					priority: agendaitem.priority,
					extended: agendaitem.extended,
					dateAdded: agendaitem.dateAdded,
					subcase: agendaitem.get('subcase'),
					agenda: agenda
				});
				agendaItemToSave.save();
			});
		});
	},
});
