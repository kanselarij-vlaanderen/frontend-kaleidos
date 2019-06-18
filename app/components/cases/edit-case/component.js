import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend({
	store: inject(),

	item: computed('caseToEdit', function () {
		return this.get('caseToEdit');
	}),

	title: getCachedProperty('title'),
	shortTitle: getCachedProperty('shortTitle'),
	type: getCachedProperty('type'),

	actions: {
		toggleIsEditing() {
			this.cancelEditing();
		},

		selectType(type) {
			this.set('type', type);
		},

		saveChanges() {
			this.set('isLoading', true);
			const caze = this.store.peekRecord('case', this.get('caseToEdit.id'));
			caze.set('title', this.get('title'));
			caze.set('shortTitle', this.get('shortTitle'));
			caze.set('type', this.get('type'));
			caze.save().then(() => {
				this.cancelEditing();
				this.set('isLoading', false);
			});
		}
	}
});
