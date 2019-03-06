import Component from '@ember/component';

export default Component.extend({
	classNames:["vlc-scroll-wrapper__body"],
	selectedAgendaItem: null,
	agendaitems:null,

	actions: {
		selectAgendaItem(agendaitem) {
			this.selectAgendaItem(agendaitem);
		}
	}
});
