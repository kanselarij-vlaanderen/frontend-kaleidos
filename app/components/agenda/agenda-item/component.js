import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	classNames: ["cases--content-tile"],
	tagName: "div",
	isShowingDetail: false,
	isShowingOptions: false,


	actions: {
		showDetail() {
			this.set('isShowingDetail', !this.get('isShowingDetail'))
		},

		showOptions() {
			this.set('isShowingOptions', !this.get('isShowingOptions'))

		},

		extendItem(agendaitem) {
			
		},

		async deleteItem(agendaitem) {
		this.store.findRecord('agendaitem', agendaitem.id, { backgroundReload: false })
		.then(foundItem => {
			foundItem.deleteRecord();
			foundItem.get('isDeleted');
			foundItem.save();
		});
		}
	}
});
