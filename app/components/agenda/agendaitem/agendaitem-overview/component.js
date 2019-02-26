import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend({
	classNames: ["vl-layout-agenda__detail"],
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

		togglePostponed() {
			this.toggleProperty('isShowingPostponeModal');
			},

		async advanceAgendaitem(agendaitem) {
			if(agendaitem && agendaitem.retracted) {
				agendaitem.set('retracted', false);
			}
			if(agendaitem && agendaitem.postponedTo) {
				const postponedObject = await agendaitem.get('postponedTo');
				postponedObject.destroyRecord();
				await postponedObject.save();
				agendaitem.set('postponedTo', undefined);
			}
			agendaitem.save();
		},

		postponeAgendaItem(agendaitem) {
			let currentSession = this.get('postponeTargetSession');
			if (currentSession) {
				const postPonedObject = this.store.createRecord('postponed', {
					meeting: currentSession,
					agendaitem: agendaitem
				});
				postPonedObject.save().then(postponedTo => {
					agendaitem.set('postponedTo', postponedTo);
				})
			} else {
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

		deleteItem(agendaitem) {
			agendaitem.destroyRecord().then(() => {
				this.set('agendaitem', null);
			});
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
