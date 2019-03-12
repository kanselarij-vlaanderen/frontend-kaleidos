import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	classNames:["vl-u-spacer-extended-l"],
	agendaitem:null,
	isReadOnly: true,

	title: computed('agendaitem', function() {
		return this.agendaitem.get('subcase.title');
	}),

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
