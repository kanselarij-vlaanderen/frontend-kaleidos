import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Controller.extend(DefaultQueryParamsMixin, {
	sessionService: inject(),
	creatingNewSession: false,
	sort:'planned-start',

	date: moment().toISOString(),
	date2: new Date().toISOString(),

	nearestMeeting: computed('model', function() {
		const meetings = this.get('model');
		const sortedMeetings = meetings.sortBy('plannedStart');
		console.log(sortedMeetings);
		return sortedMeetings;
	}),

	actions: {
		selectAgenda(meeting) {
			this.set('sessionService.currentSession', meeting);
			this.transitionToRoute('agendas');
		},
		createNewSession() {
			this.toggleProperty('creatingNewSession');
		}, 
		cancelNewSessionForm() {
			this.set('creatingNewSession', false);
			this.refresh();
		}
	}
});
