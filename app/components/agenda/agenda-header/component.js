import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export default Component.extend({
	store: inject(),
	sessionService: inject(),
	agendaService: inject(),
	classNames: ["c-page-header"],

	creatingNewSession: null,
	sessions: null,
	selectedAgendaItem: null,
	isShowingOptions: false,

	currentAgendaItems: alias('sessionService.currentAgendaItems'),
	currentSession: alias('sessionService.currentSession'),
	currentAgenda: alias('sessionService.currentAgenda'),
	agendas: alias('sessionService.agendas'),
	definiteAgendas: alias('sessionService.definiteAgendas'),

	designAgendaPresent: computed('agendas', function () {
		const agendas = this.get('agendas')
		if (agendas && agendas.length >= 0) {
			return agendas.find(agenda => agenda.name == "Ontwerpagenda");
		} else {
			return false;
		}
	}),

	actions: {
		async approveAgenda(session) {
			let agendas = await this.get('agendas');
			let agendaToLock = await agendas.find(agenda => agenda.name == "Ontwerpagenda");
			let definiteAgendas = await this.get('definiteAgendas');
			let lastDefiniteAgenda = await definiteAgendas.get('firstObject');

			if (!lastDefiniteAgenda) {
				agendaToLock.set('name', alphabet[0]);
			} else {
				agendaToLock.set('name', alphabet[definiteAgendas.length] || definiteAgendas.length);
			}

			agendaToLock.set('isFinal', true);

			agendaToLock.save().then(() => {
				this.get('agendaService').approveAgendaAndCopyToDesignAgenda(session, agendaToLock).then(newAgenda => {
					session.notifyPropertyChange('agendas');
					this.set('sessionService.currentAgenda', newAgenda);
					session.notifyPropertyChange('sessionService.agendas');
					this.set('selectedAgendaItem', null);
				});
			})
		},

		async lockAgenda(agenda) {
			if (agenda.isFinal) {
				agenda.set('isFinal', false);
			} else {
				agenda.set('isFinal', true);
			}
		},

		chooseSession(session) {
			this.set('sessionService.currentAgenda', null);
			this.set('sessionService.currentSession', session);
		},

		showMultipleOptions() {
			this.toggleProperty('isShowingOptions')
		},

		createNewSession() {
			this.set('creatingNewSession', true);
		},

		cancelNewSessionForm() {
			this.set('creatingNewSession', false);
			this.set('sessions', this.store.query('meeting', {}))
		},

		compareAgendas() {
			this.compareAgendas();
		},

		async deleteDesignAgenda(agenda) {
			const definiteAgendas = await this.get('definiteAgendas');
			const lastDefiniteAgenda = await definiteAgendas.get('firstObject');

			agenda.destroyRecord().then(() => {
				this.set('sessionService.currentAgenda', lastDefiniteAgenda || null )
			});
		},

		async createNewDesignAgenda() {
			const session = this.get('currentSession');
			const definiteAgendas = await this.get('definiteAgendas');
			const lastDefiniteAgenda = await definiteAgendas.get('firstObject');
			
			this.get('agendaService').approveAgendaAndCopyToDesignAgenda(session, lastDefiniteAgenda).then(newAgenda => {
				session.notifyPropertyChange('agendas');
				this.set('sessionService.currentAgenda', newAgenda);
				session.notifyPropertyChange('sessionService.agendas');
				this.set('selectedAgendaItem', null);
			});
		}
	},

	async didInsertElement() {
		this._super(...arguments);
		if (!this.get('currentSession')) {
			this.set('sessionService.currentSession', this.get('sessions.firstObject'));
		}
	}
});
