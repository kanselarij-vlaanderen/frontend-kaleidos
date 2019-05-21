import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	classNames: ["vlc-panel-layout__main-content"],
	currentAgenda: alias('sessionService.currentAgenda'),
	sessionService: inject(),
	store: inject(),
	postponeTargetSession: null,
	isShowingDetail: false,
	agendaitemToShowOptionsFor: null,
	isShowingPostponeModal: false,
	currentAgendaItem: null,
	activeAgendaItemSection: 'details',
	showOptions: false,

	subcase: computed('agendaitem.subcase', function () {
		return this.get('agendaitem.subcase').then((subcase) => {
			return subcase;
		})
	}),

	isPostPonable: computed('sessionService.agendas.@each', function () {
		return this.get('sessionService.agendas').then(agendas => {
			if (agendas && agendas.length > 1) {
				return true;
			} else {
				return false;
			}
		})
	}),

	lastDefiniteAgenda: computed('sessionService.definiteAgendas.firstObject', async function () {
		const definiteAgendas = await this.get('sessionService.definiteAgendas');
		return definiteAgendas.get('lastObject');
	}),

	actions: {
		showDetail() {
			this.toggleProperty('isShowingDetail');
		},

		showOptions() {
			this.toggleProperty('showOptions');
		},

		async addDecision() {
			const subcase = await this.get('subcase');
			const newDecision = this.store.createRecord('decision', {
				approved: false, subcase
			})
			await newDecision.save();
			await subcase.get('decisions').addObject(newDecision);
		},

		async togglePostponed(agendaitem) {
			if (agendaitem) {
				let isPostponed = await agendaitem.get('isPostponed');
				if (isPostponed) {
					agendaitem.set('retracted', false);
					agendaitem.set('postponed', null);
					agendaitem.save();
				} else {
					this.toggleProperty('isShowingPostponeModal');
				}
			} else {
				this.toggleProperty('isShowingPostponeModal');
			}
		},

		postponeAgendaItem(agendaitem) {
			let currentSession = this.get('postponeTargetSession');
			if (currentSession) {
				const postPonedObject = this.store.createRecord('postponed', {
					meeting: currentSession,
					agendaitem: agendaitem
				});
				postPonedObject.save().then(postponedTo => {
					agendaitem.set('postponed', postponedTo);
				})
			} else {
				const postPonedObject = this.store.createRecord('postponed', {
					meeting: null,
					agendaitem: agendaitem
				});
				postPonedObject.save().then(postponedTo => {
					agendaitem.set('postponed', postponedTo);
				});
				agendaitem.set('retracted', !agendaitem.retracted);
			}
			agendaitem.save().then(() => {
				this.set('postponeTargetSession', null);
				this.toggleProperty('isShowingPostponeModal')
			});
		},

		chooseSession(session) {
			this.set('postponeTargetSession', session);
		},

		async deleteItem(agendaitem) {
			const itemToDelete = await this.store.findRecord('agendaitem', agendaitem.get('id'));
			const subcase = await this.get('subcase');
			if (subcase) {
				const phases = await subcase.get('phases');
				await Promise.all(phases.filter(async phase => {
					const code = await phase.get('code');
					if (!code || code.get('label') == "Ingediend voor agendering") {
						await phase.destroyRecord();
					} else {
						return phase;
					}
				}))
				subcase.set('requestedForMeeting', null);
				subcase.save();
			}

			itemToDelete.destroyRecord().then(() => {
				this.set('sessionService.selectedAgendaItem', null);
				this.refreshRoute(agendaitem.id);
			});
		},

		async advanceAgendaitem(agendaitem) {
			if (agendaitem && agendaitem.retracted) {
				agendaitem.set('retracted', false);
			}
			const postponedTo = await agendaitem.get('postponedTo');
			if (agendaitem && postponedTo) {
				await postponedTo.destroyRecord();
				await agendaitem.set('postponedTo', undefined);
			}
			agendaitem.save();
		},

		toggleShowMore(agendaitem) {
			if (agendaitem.showDetails) {
				agendaitem.save();
			}
			agendaitem.toggleProperty("showDetails");
		},

		setAgendaItemSection(section) {
			this.set("activeAgendaItemSection", section);
		}
	}
});