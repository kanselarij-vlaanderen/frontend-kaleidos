import Component from '@ember/component';

export default Component.extend({
	classNames: ["agenda-item-container"],
	tagName: "div",
	isShowingDetail: false,
	agendaitemToShowOptionsFor: null,
	isShowingExtendModal: false,
	currentAgendaItem:null,

	actions: {
		showDetail() {
			this.set('isShowingDetail', !this.get('isShowingDetail'))
		},

		toggleModal(agendaitem) {
			this.set('currentAgendaItem', agendaitem);
			this.toggleProperty('isShowingExtendModal');
		},

		showOptions(agendaitem) {
			let itemToShowOptionsFor = this.get('agendaitemToShowOptionsFor');
			let deSelectCurrentlySelected = itemToShowOptionsFor && itemToShowOptionsFor.id === agendaitem.id;
			if (deSelectCurrentlySelected) {
				this.set('agendaitemToShowOptionsFor', null);
			} else {
				this.set('agendaitemToShowOptionsFor', agendaitem);
			}
		},

		extendAgendaItem(agendaitem) {
			agendaitem.set('extended', !agendaitem.extended);
			agendaitem.save();
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
		}
	}
});
