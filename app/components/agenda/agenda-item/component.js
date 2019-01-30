import Component from '@ember/component';

export default Component.extend({
	classNames: ["agenda-item-container"],
	tagName: "div",
	selectedAgendaItem: null,

	actions: {
		selectAgendaItem(agendaitem) {
			this.set('selectedAgendaItem', agendaitem);
      this.set("addComment", false);
		},
	}
});
