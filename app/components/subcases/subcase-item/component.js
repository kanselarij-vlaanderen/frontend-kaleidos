import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';
export default Component.extend(isAuthenticatedMixin, {
	classNames: ["vlc-procedure-step"],
	classNameBindings: ["getClassNames"],

	getClassNames: computed('isMinimal', function () {
		const { isMinimal } = this;
		if (isMinimal) {
			return 'vlc-procedure-step--minimal';
		}
	})

});
