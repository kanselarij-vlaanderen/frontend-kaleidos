import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
	classNames: ["vl-u-spacer-extended-bottom"],
	isEditing: false,

	allowEditing: computed('definite', function () {
		return this.definite === 'false';
	}),

});
