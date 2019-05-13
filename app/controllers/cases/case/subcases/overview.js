import Controller from '@ember/controller';

export default Controller.extend({
	isShowingOptions: false,
	isShowingOverview: true,
	isShowingProcess: false,

	actions: {
		refresh() {
			// this.send('refresh');
		},
	}
});
