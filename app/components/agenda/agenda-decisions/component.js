
import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	isEditing: false,

	actions: {
		close() {
			this.closeModal();
		},
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		}
	}
});
