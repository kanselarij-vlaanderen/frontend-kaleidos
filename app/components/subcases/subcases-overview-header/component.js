import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
	classNames: ["vl-u-bg-alt"],
	isAddingSubcase: false,

	activeProcess: computed('isShowingProcess', function () {
		if (this.get('isShowingProcess')) {
			return 'vlc-tabs-reverse__link--active';
		}
	}),

	activeOverview: computed('isShowingOverview', function () {
		if (this.get('isShowingOverview')) {
			return 'vlc-tabs-reverse__link--active';
		}
	}),

	actions: {
		toggleIsAddingSubcase() {
			this.toggleProperty('isAddingSubcase');
		},

		close() {
			this.toggleProperty('isAddingSubcase');
			this.refresh();
		},

		toggleIsShowingProcess() {
			this.set('isShowingProcess', true);
			this.set('isShowingOverview', false);
		},

		toggleIsShowingOverview() {
			this.set('isShowingProcess', false);
			this.set('isShowingOverview', true);
		},
	}
});
