import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	classNames:["vl-u-spacer-extended-l"],
	agendaitem:null,
	isEditing:false,

	title: computed('agendaitem', function() {
		return this.agendaitem.get('subcase.title');
	}),

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		}
	}
});
