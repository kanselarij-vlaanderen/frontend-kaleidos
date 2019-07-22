import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(isAuthenticatedMixin, {
	store: inject(),
	globalError: inject(),

	isLoading: false, 
	
	actions: {
		setSessionDate(startedAt) {
			startedAt = moment(startedAt).utc().toDate();
			this.set('model.startedAt', startedAt);
			const modified = moment().utc().toDate();
			this.set('model.modified', modified);
		},

		save() {
			this.set('isLoading', true);
			this.get('model').save()
				.catch((error) => {
				this.globalError.handleError(error);
			}).finally(() => {
				this.set('isLoading', false);
				this.transitionToRoute('oc.meetings.index');
			});
		},

		cancel() {
			this.transitionToRoute('oc.meetings.index');
		},
	}
});
