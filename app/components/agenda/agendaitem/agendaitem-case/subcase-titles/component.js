import Component from '@ember/component';
import { computed } from '@ember/object';
export default Component.extend({

	agenda: computed('agendaitem', function() {
		return this.get('agendaitem.agenda.name');
	}),
	
	actions: {
		toggleIsEditing() {
			this.toggleIsEditing();
		}
	}
});
