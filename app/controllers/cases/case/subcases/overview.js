import Controller from '@ember/controller';

export default Controller.extend({
	isAddingSubcase:false,

	actions: {
		toggleIsAddingSubcase() {
			this.toggleProperty('isAddingSubcase');
		},

		close() {
			this.toggleProperty('isAddingSubcase');
		}
	}
});
