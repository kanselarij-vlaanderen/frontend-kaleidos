import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import $ from 'jquery';

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
			this.addAgendaToSession(session, agendaToLock).then(result => {
				if(result) {
					this.navigateBack(session.id);
				} else {
					// TODO: ERROR handling
				}
			});
			})
		},

		resetValueIfEmpty(param) {
			if (param == "") {
				this.set('sessions', this.store.query('session', {
					filter: {
						// ':gte:plannedstart': new Date().toISOString()
					}
				}));
			}
		},

		createNewSession() {
			this.set('creatingNewSession', true);
		}
	},

	addAgendaToSession(currentSession, oldAgenda) {
		let agendaLength = currentSession.agendas.length;
		let newAgenda = this.store.createRecord('agenda', {
			name: "Ontwerpagenda " + alphabet[agendaLength].toUpperCase(),
			session: currentSession
		})
		return new Promise((resolve, reject) => {
			newAgenda.save().then(agenda => {
				$.ajax(
					{
						method: "POST",
						url: 'http://localhost/agenda-approve/approveAgenda',
						data: {
							newAgendaId: agenda.id,
							oldAgendaId: oldAgenda.id
						}
					}
				).then(result => {
					resolve(result);
				}).catch(error => {
					reject(error);
				})
			});
		})
	},
});
