import Controller from '@ember/controller';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(isAuthenticatedMixin, {
	isAddingSubcase:false,
	isShowingOptions: false,
	
	actions: {
		toggleIsAddingSubcase() {
			this.toggleProperty('isAddingSubcase');
		},
		close() {
			this.toggleProperty('isAddingSubcase');
			this.send('refresh');
		},

    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },
	}
});
