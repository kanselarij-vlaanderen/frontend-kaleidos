import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin, {
	sessionService: inject(),
	creatingNewSession: false,
	sort: '-planned-start',
	size: 10,

	nearestMeeting: computed('model', function () {
		const meetings = this.get('model');
		const sortedMeetings = meetings.sortBy('plannedStart');

		let closest = sortedMeetings.get('lastObject');
		const now = moment().utc().format();
		sortedMeetings.map(function (meeting) {
			let date = moment(meeting.plannedStart).utc().format();
			let closestDate = moment(closest.plannedStart).utc().format();
			if (date >= now && date < closestDate) {
				closest = meeting;
			}
		});
		sortedMeetings.removeObject(closest);
		if (this.page === 0) {
			closest.set('alreadyShown', true);
		}
		return closest;
	}),

	futureMeetings: computed('model', 'nearestMeeting', function () {
		const meetings = this.get('model');
		const nearestMeetingDate = moment(this.get('nearestMeeting.plannedStart')).utc().format();
		return meetings.filter(meeting => {
			let date = moment(meeting.plannedStart).utc().format();

			if (date > nearestMeetingDate) {
				if (this.page === 0) {

					const found = meetings.find((meetingToCheck) => meetingToCheck.get('id') === meeting.get('id'));
					if (found) {
						found.set('alreadyShown', true);
					}
				}
				return meeting;
			}
		}).sortBy('plannedStart');
	}),

	actions: {
		selectAgenda(meeting) {
			this.set('sessionService.selectedAgendaItem', null);
			this.set('sessionService.currentSession', meeting);
			this.transitionToRoute('agenda.agendaitems', meeting.id);
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
		},
		// deleteSession(meeting) {
		// 	meeting.destroyRecord().then(() => {
		// 		this.send('refresh');
		// 	});
		// }
	}
});
