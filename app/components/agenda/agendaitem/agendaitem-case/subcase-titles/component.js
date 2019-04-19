import Component from '@ember/component';
import { computed } from '@ember/object';
export default Component.extend({

	agenda: computed('item', function() {
		return this.get('item.agenda.name');
	}),
	
	actions: {
		toggleIsEditing() {
			this.toggleIsEditing();
		}
	}
});
