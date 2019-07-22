import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin, {
	intl: inject(),

	creatingNewSession: false,
	sort: '-started-at',
	size: 10,

	actions: {
		selectSession(session) {
			this.transitionToRoute('oc.meetings.meeting', session);
		},
		createNewSession() {
			this.toggleProperty('creatingNewSession');
		},
		cancelNewSessionForm() {
			this.set('creatingNewSession', false);
		},
		successfullyAdded() {
			this.set('creatingNewSession', false);
			this.send('refresh');
		}
	}
});
