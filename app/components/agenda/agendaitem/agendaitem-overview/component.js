import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend({
	sessionService: inject(),
	store: inject(),
	currentAgenda: alias('sessionService.currentAgenda'),
	currentSession: null,
	classNames: ["agenda-item-container"],
	tagName: "div",
	isShowingDetail: false,
	agendaitemToShowOptionsFor: null,
	isShowingExtendModal: false,
	currentAgendaItem: null,
	activeAgendaItemSection: 'details',
	showOptions:false,

	isPostPonable: computed('sessionService.agendas', function () {
		let agendas = this.get('sessionService.agendas')
		if (agendas && agendas.length > 1) {
			return true;
		} else {
			return false;
		}
	}),

	lastDefiniteAgenda: computed('sessionService.definiteAgendas', function () {
		return this.get('sessionService.definiteAgendas.firstObject');
	}),

	actions: {
		showDetail() {
			this.toggleProperty('isShowingDetail');
		},

		showOptions() {
			this.toggleProperty('showOptions');
		},

		async toggleModal(agendaitem) {
			if (agendaitem) {
				let postponedToSession = await agendaitem.get('postponedToSession');
				if (agendaitem.extended) {
					agendaitem.set('extended', false);
					agendaitem.save();
				} else if (postponedToSession) {
					agendaitem.set('postponedToSession', null);
					agendaitem.save();
				} else {
					this.toggleProperty('isShowingExtendModal');
				}
			}
		},

		async extendAgendaItem(agendaitem) {
			let currentSession = await this.get('currentSession');
			
			if (currentSession) {
				agendaitem.set('postponedToSession', currentSession);
			} else {
				agendaitem.set('extended', true);
			}
			await agendaitem.save();

			this.set('currentSession', null);
			this.set('isShowingExtendModal', false);
		},

		chooseSession(session) {
			this.set('currentSession', session);
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
