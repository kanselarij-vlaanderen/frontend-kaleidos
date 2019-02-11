import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export default Component.extend({
	store: inject(),
	sessionService: inject(),
	agendaService: inject(),
	classNames: ["c-page-header"],
	tagName: "div",

	creatingNewSession: null,
	sessions:null,
	selectedAgendaItem:null,

	currentAgendaItems: alias('sessionService.currentAgendaItems'),
	currentSession: alias('sessionService.currentSession'),
	currentAgenda: alias('sessionService.currentAgenda'),
	agendas: alias('sessionService.agendas'),
	definiteAgendas: alias('sessionService.definiteAgendas'),

	actions: {
		async lockAgenda(session) {
			let agendas = await this.get('agendas');
			let agendaToLock = agendas.get('firstObject');
			let definiteAgendas = await this.get('definiteAgendas');
			let lastDefiniteAgenda = definiteAgendas.get('firstObject');

			if (!lastDefiniteAgenda) {
				agendaToLock.set('name', alphabet[0]);
			} else {
				agendaToLock.set('name', alphabet[definiteAgendas.length] || definiteAgendas.length);
			}

			agendaToLock.set('locked', true);

			agendaToLock.save().then(() => {
				this.get('agendaService').approveAgendaAndCopyToDesignAgenda(session, agendaToLock).then(newAgenda => {
					session.notifyPropertyChange('agendas');
					this.set('sessionService.currentAgenda', newAgenda);
					session.notifyPropertyChange('sessionService.agendas');
					this.set('selectedAgendaItem', null);
				});
			})
		},

		chooseSession(session) {
			this.set('sessionService.currentAgenda', null);
			this.set('sessionService.currentSession', session);
		},

		createNewSession() {
			this.set('creatingNewSession', true);
		},

		cancelNewSessionForm() {
			this.set('creatingNewSession', false);
		},

		compareAgendas() {
			this.compareAgendas();
		},
	},

	async didInsertElement() {
		this._super(...arguments);
		if(!this.get('currentSession')) {
			this.set('sessionService.currentSession', this.get('sessions.firstObject'));
		}
	}
});
