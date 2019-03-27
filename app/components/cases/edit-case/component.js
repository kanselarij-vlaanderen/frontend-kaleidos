import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
export default Component.extend({
	store: inject(),

	title: computed('caseToEdit', {
		get() {
			const caze = this.get('caseToEdit');
			if (caze) {
				return caze.get('title');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	shortTitle: computed('caseToEdit', {
		get() {
			const caze = this.get('caseToEdit');
			if (caze) {
				return caze.get('shortTitle');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	type: computed('caseToEdit', function() {
		const caze = this.get('caseToEdit');
		return caze.get('type');
	}),

	actions: {
		toggleIsEditing() {
			this.cancelEditing();
		},
		
		selectType(type) {
			this.set('type', type);
		},

		saveChanges() {
			const caze = this.store.peekRecord('case', this.get('caseToEdit.id'));
			caze.set('title', this.get('title'));
			caze.set('shortTitle', this.get('shortTitle'));
			caze.set('type', this.get('type'));
			caze.save().then(() => {
				this.cancelEditing();
			});
		}
	}
});
