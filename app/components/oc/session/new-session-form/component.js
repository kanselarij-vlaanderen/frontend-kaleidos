
import Component from '@ember/component';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default Component.extend({
	store: inject(),
	globalError: inject(),

	createSession(startedAt, modified) {
	console.log("started at on save", startedAt);
	const session = this.store.createRecord('oc-meeting', {
			startedAt,
			modified
		});
		return session.save();
	},

	actions: {
		async createNewSession() {
			this.set('isLoading', true);
			const date = moment().utc().toDate();
			const startDate = this.get('startedAt');
			console.log("started at on create", startDate);
			this.createSession(startDate, date).then(async (session) => {
				// pass
			}).catch((error) => {
				this.globalError.handleError(error);
			}).finally(() => {
				this.set('isLoading', false);
				this.successfullyAdded();
			});
		},

		selectStartDate(val) {
			this.set('startedAt', moment(val).utc().toDate());
			console.log("started at", this.get('startedAt'));
		},

		cancelForm(event) {
			this.cancelForm(event);
		},

		successfullyAdded() {
			this.successfullyAdded();
		}
	}
});
