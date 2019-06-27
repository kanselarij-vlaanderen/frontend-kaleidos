import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias, filter } from '@ember/object/computed';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, {
	store: inject(),
	sessionService: inject(),
	agendaService: inject(),
	classNames: ["vlc-page-header"],

	isShowingOptions: false,
	isPrintingNotes: false,
	isAddingAnnouncement: false,
	isAddingAgendaitems: false,

	currentAgendaItems: alias('sessionService.currentAgendaItems'),
	currentSession: alias('sessionService.currentSession'),
	currentAgenda: alias('sessionService.currentAgenda'),
	agendas: alias('sessionService.agendas'),
	selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
	definiteAgendas: alias('sessionService.definiteAgendas'),

	designAgendaPresent: filter('currentSession.agendas.@each.name', function (agenda) {
		return agenda.get('name') === "Ontwerpagenda";
	}),

	async createDesignAgenda() {
		this.changeLoading();
		const session = this.get('currentSession');
		session.set('isFinal', false);
		session.save();
		const definiteAgendas = await this.get('definiteAgendas');
		const lastDefiniteAgenda = await definiteAgendas.get('firstObject');

		this.get('agendaService').approveAgendaAndCopyToDesignAgenda(session, lastDefiniteAgenda).then(newAgenda => {
			this.changeLoading();
			this.set('sessionService.currentAgenda', newAgenda);
			this.reloadRoute(newAgenda.get('id'));
		});
	},

	actions: {
		navigateToNotes() {
			const { currentSession, currentAgenda } = this;
			this.navigateToNotes(currentSession.get('id'), currentAgenda.get('id'));
		},

		navigateToPressAgenda() {
			const { currentSession, currentAgenda } = this;
			this.navigateToPressAgenda(currentSession.get('id'), currentAgenda.get('id'));
		},

		navigateToNewsletter() {
			const { currentSession, currentAgenda } = this;
			this.navigateToNewsletter(currentSession.get('id'), currentAgenda.get('id'));
		},

		navigateToDecisions() {
			const { currentSession, currentAgenda } = this;
			this.navigateToDecisions(currentSession.get('id'), currentAgenda.get('id'));
		},

		clearSelectedAgendaItem() {
			this.clearSelectedAgendaItem();
		},

		cancel() {
			this.set('showWarning', false);
		},

		verify() {
			this.set('showWarning', false);
		},

		async approveAgenda(session) {
			const isApprovable = await this.currentAgenda.get('isApprovable');
			if (!isApprovable) {
				this.set('showWarning', true);
			} else {
				this.changeLoading();
				let agendas = await this.get('agendas');
				let agendaToLock = await agendas.find(agenda => agenda.name == "Ontwerpagenda");
				if (agendaToLock) {
					agendaToLock = await this.store.findRecord('agenda', agendaToLock.get('id'));
				}
				let definiteAgendas = await this.get('definiteAgendas');
				let lastDefiniteAgenda = await definiteAgendas.get('firstObject');

				if (!lastDefiniteAgenda) {
					agendaToLock.set('name', CONFIG.alphabet[0]);
				} else {
					if (definiteAgendas) {
						const agendaLength = definiteAgendas.length;

						if (agendaLength && CONFIG.alphabet[agendaLength]) {
							if (agendaLength < (CONFIG.alphabet.get('length') - 1)) {
								agendaToLock.set('name', CONFIG.alphabet[agendaLength]);
							}
						} else {
							agendaToLock.set('name', agendaLength + 1);
						}
					} else {
						agendaToLock.set('name', agendas.get('length') + 1);
					}
				}

				agendaToLock.set('isAccepted', true);
				agendaToLock.set('modified', moment().utc().toDate());
				agendaToLock.save().then((agendaToApprove) => {
					this.get('agendaService').approveAgendaAndCopyToDesignAgenda(session, agendaToApprove).then(newAgenda => {
						this.changeLoading();
						this.get('agendaService').sortAgendaItems(newAgenda);
						this.get('agendaService').sortAgendaItems(agendaToLock);
						this.set('sessionService.currentAgenda', newAgenda);
						this.set('sessionService.selectedAgendaItem', null);
						this.reloadRoute(newAgenda.get('id'));
					});
				})
			}
		},

		async lockAgenda() {
			const agendas = await this.get('agendas');
			const draft = agendas.filter(agenda => agenda.name === "Ontwerpagenda").sortBy('-name').get('firstObject');
			const lastAgenda = agendas.filter(agenda => agenda.name !== "Ontwerpagenda").sortBy('-name').get('firstObject');

			if (draft) {
				await draft.destroyRecord();

				const session = await lastAgenda.get('createdFor');
				session.set('isFinal', true);
				await session.save();
				this.set('sessionService.currentAgenda', lastAgenda);
				this.reloadRoute();
			}
		},

		async unlockAgenda() {
			await this.createDesignAgenda();
		},

		showMultipleOptions() {
			this.toggleProperty('isShowingOptions');
		},

		compareAgendas() {
			this.compareAgendas();
		},

		navigateToSubCases() {
			this.set('isAddingAgendaitems', true);
		},

		toggleIsAddingAnnouncement() {
			this.toggleProperty('isAddingAnnouncement');
		},

		navigateToCreateAnnouncement() {
			this.set('addingAnnouncement', true);
		},

		async deleteDesignAgenda(agenda) {
			const definiteAgendas = await this.get('definiteAgendas');
			const lastDefiniteAgenda = await definiteAgendas.get('firstObject');

			agenda.destroyRecord().then(() => {
				this.set('sessionService.currentAgenda', lastDefiniteAgenda || null)
			});
		},

		async createNewDesignAgenda() {
			await this.createDesignAgenda();
		},

		reloadRoute(id) {
			this.reloadRoute(id);
		},

		selectSignature() {
			this.toggleProperty('isAssigningSignature', false);
		}
	},

	changeLoading() {
		this.loading();
	},

	reloadRoute(id) {
		this.reloadRouteWithNewAgenda(id);
	}
});
