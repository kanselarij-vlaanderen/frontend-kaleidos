import Controller from '@ember/controller';

export default Controller.extend({
	queryParams: ['refresh'],

	isShowingOptions: false,
	isShowingOverview: true,
	isShowingProcess: false,
	refresh: false,

	actions: {
		refresh() {
			this.toggleProperty('refresh')
		},
	}
});
