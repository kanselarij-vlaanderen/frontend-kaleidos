import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend(DefaultQueryParamsMixin, {
	sort: '-planned-start',
	sessionService: inject(),

	currentSession: alias('sessionService.currentSession'),

	actions: {
		navigateToNewsLetter(meeting) {
			const { currentSession } = this;
			this.set('sessionService.currentSession', currentSession);
			this.transitionToRoute('newsletters-overview', {'meeting_id': meeting.get('id')});
		}
	}
});
