import Component from '@ember/component';

export default Component.extend({
	classNames:["press-agenda-container"],
	agendaitem:null,
	isReadOnly: true,

	actions: {
		updatePressAgenda(agendaitem) {
			agendaitem.save().then(() => {
				this.toggleProperty('isReadOnly');
			})
		},

		editPressAgenda() {
			this.toggleProperty('isReadOnly');
		}
	}
});
