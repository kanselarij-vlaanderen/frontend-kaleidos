import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
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
