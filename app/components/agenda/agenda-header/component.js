import Component from '@ember/component';
import { inject } from '@ember/service';

const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export default Component.extend({
	store: inject(),
	agendaService: inject(),
	classNames: ["files--header-tile", "files--search"],
	tagName: "div",
	creatingNewSession: null,
	currentAgendaItems: null,
	currentSession: null,
	currentAgenda: null,
	sessions:null,

	actions: {
		async lockAgenda(session) {
			let agendas = await this.store.query('agenda', {
				filter: {
					session: { id: session.id }
				},
				sort: 'name'
			});

			let agendaToLock = agendas.get('firstObject');

			let definiteAgendas = agendas.filter(agenda => agenda.name != "Ontwerpagenda")
			let lastDefiniteAgenda = definiteAgendas.get('firstObject');

			if (!lastDefiniteAgenda) {
				agendaToLock.set('name', alphabet[0]);
			} else {
				agendaToLock.set('name', alphabet[definiteAgendas.length])
			}

			agendaToLock.set('locked', true);

			agendaToLock.save().then(async () => {
				this.get('agendaService').addAgendaToSession(session, agendaToLock).then(async newAgenda => {
					if (newAgenda) {
						await this.loadSessions().then(() => {
							this.set('currentSession', session);
							this.notifyPropertyChange('currentSession');
						});
					}
				});
			})
		},
		
		createNewSession() {
			this.set('creatingNewSession', true);
		},

		async cancelNewSessionForm() {
			this.set('creatingNewSession', false);
			await this.loadSessions();
		}
	},

	async didInsertElement() {
		this._super(...arguments);
		if(!this.get('currentSession')) {
			this.set('currentSession', this.get('sessions').get('firstObject'));
		}
	}
});
