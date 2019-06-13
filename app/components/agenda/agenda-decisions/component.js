
import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';
export default Component.extend(isAuthenticatedMixin, {
	isEditing: false,

	allowEditing: computed('definite', function () {
		return this.definite === 'false';
	}),

	actions: {
		close() {
			this.closeModal();
		},
		toggleIsEditing(decision) {
			decision.toggleProperty('isEditing');
		}
	}
});
