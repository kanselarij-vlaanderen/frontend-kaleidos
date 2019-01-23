import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	classNames: ["cases--content-tile"],
	tagName: "div",
	isShowingDetail: false,
	agendaitemToShowOptionsFor: null,

	actions: {
		showDetail() {
			this.set('isShowingDetail', !this.get('isShowingDetail'))
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

		changeExtendedValue(agendaitem) {
			agendaitem.set('extended', !agendaitem.extended);
			agendaitem.save();
		},

		async deleteItem(agendaitem) {
			await agendaitem.destroyRecord();
		},

		toggleShowMore(agendaitem) {
			if (agendaitem.showDetails) {
				agendaitem.save();
			}
			agendaitem.toggleProperty("showDetails");
		}
	}
});
