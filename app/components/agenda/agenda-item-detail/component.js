import Component from '@ember/component';

export default Component.extend({
	classNames: ["agenda-item-container"],
	tagName: "div",
	isShowingDetail: false,
	agendaitemToShowOptionsFor: null,
	isShowingExtendModal: false,
	currentAgendaItem: null,

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
