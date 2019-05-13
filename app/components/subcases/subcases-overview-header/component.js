import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	classNames: ["vl-u-bg-alt"],
	isAddingSubcase: false,

	actions: {
		toggleIsAddingSubcase() {
			this.toggleProperty('isAddingSubcase');
		},

		close() {
			this.toggleProperty('isAddingSubcase');
			this.send('refresh');
		},

		toggleIsShowingProcess() {
			this.toggleProperty('isShowingOverview');
			this.toggleProperty('isShowingProcess');
		},

		toggleIsShowingOverview() {
			this.toggleProperty('isShowingProcess');
			this.toggleProperty('isShowingOverview');
		},
	}
});
