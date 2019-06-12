
import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';
export default Component.extend(isAuthenticatedMixin, {
	isEditing: false,

	allowEditing: computed('definite', function () {
		return this.definite === 'true';
	}),

	actions: {
		close() {
			this.closeModal();
		},
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		}
	}
});
