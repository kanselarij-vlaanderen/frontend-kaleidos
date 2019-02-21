import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend({
	sessionService: inject(),
	currentAgenda: alias('sessionService.currentAgenda'),
	classNames: ["c-agenda-item"],
	tagName: "div",
	isShowingDetail: false,
	agendaitemToShowOptionsFor: null,
	isShowingPostponeModal: false,
	currentAgendaItem: null,

	lastDefiniteAgenda: computed('sessionService.definiteAgendas.@each', function() {
		return this.get('sessionService.definiteAgendas.firstObject');
	}),

	actions: {
		showDetail() {
			this.set('isShowingDetail', !this.get('isShowingDetail'))
		},

		togglePostponeModal(agendaitem) {
			this.set('currentAgendaItem', agendaitem);
			this.toggleProperty('isShowingPostponeModal');
		},

		postponeAgendaItem(agendaitem) {
			let currentSession = this.get('currentSession');
			if (currentSession) {
				agendaitem.set('postponedToSession', currentSession);
			} else {
				agendaitem.set('retracted', !agendaitem.retracted);
			}
			agendaitem.save().then(() => {
				this.set('currentSession', null);
			});
		},

		chooseSession(session) {
			this.set('currentSession', session);
		},

		deleteItem(agendaitem) {
			agendaitem.destroyRecord().then(() => {
				this.set('agendaitem', null);
			});
		}
	}
});
