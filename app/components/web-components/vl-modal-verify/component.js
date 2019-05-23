import Component from '@ember/component';

export default Component.extend({
	message: null,
	title: null,

	actions: {
		verify() {
			this.verify();
		},

		cancel() {
			this.cancel();
		}
	}
});
