import Component from '@ember/component';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
	store: inject(),
	classNames: ['vl-u-spacer'],
	isEditing: false,

	allowEditing: computed('definite', function () {
		return this.definite === 'false';
	}),

});
