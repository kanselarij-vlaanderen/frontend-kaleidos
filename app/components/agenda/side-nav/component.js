import Component from '@ember/component';

export default Component.extend({
	classNames: ['side--menu-container'],
	classNameBindings: ['agendaMenuOpened:opened'],
	currentAgenda:null,
	currentSession:null,
	selectedAgendaItem:null,
	agendaMenuOpened:null,

	actions: {
		collapseSideMenu() {
			this.set('agendaMenuOpened', !this.get('agendaMenuOpened'));
		},

		compareAgendas() {
			this.compareAgendas();
		},

		setCurrentAgenda(agenda) {
			this.set('selectedAgendaItem', null);
			this.set('currentAgenda', agenda);
		}
	},
});
