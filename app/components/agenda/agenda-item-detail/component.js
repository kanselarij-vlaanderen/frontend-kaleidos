import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend({
	sessionService: inject(),
	currentAgenda: alias('sessionService.currentAgenda'),
	classNames: ["agenda-item-container"],
	tagName: "div",
	isShowingDetail: false,
	agendaitemToShowOptionsFor: null,
	isShowingExtendModal: false,
	currentAgendaItem: null,

	isPostPonable: computed('sessionService.agendas.@each',  function() {
		let agendas = this.get('sessionService.agendas')
		if(agendas && agendas.length > 1) {
			return true;
		} else {
			return false;
		}
	}),

	lastDefiniteAgenda: computed('sessionService.definiteAgendas.@each', function() {
		return this.get('sessionService.definiteAgendas.firstObject');
	}),

	actions: {
		showDetail() {
			this.set('isShowingDetail', !this.get('isShowingDetail'))
		},

		toggleModal(agendaitem) {
			this.set('currentAgendaItem', agendaitem);
			this.toggleProperty('isShowingExtendModal');
		},

		extendAgendaItem(agendaitem) {
			
			let currentSession = this.get('currentSession');
			if (currentSession) {
				agendaitem.set('postPonedToSession', currentSession);
			} else {
				agendaitem.set('extended', !agendaitem.extended);
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
