import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin, {
	sessionService: inject(),
	creatingNewSession: false,
	// sort: '-planned-start',
	size:10,
	sizes: [10,20,50,100,200],

	nearestMeeting: computed('model', function () {
		const meetings = this.get('model');
		const sortedMeetings = meetings.sortBy('plannedStart');

		let closest = sortedMeetings.get('lastObject');
		const now = moment().format();
		sortedMeetings.map(function (meeting) {
			let date = moment(meeting.plannedStart).format();
			let closestDate = moment(closest.plannedStart).format();
			if (date >= now && date < closestDate) {
				closest = meeting;
			}
		});
		sortedMeetings.removeObject(closest);
		return closest;
	}),

	futureMeetings: computed('model', 'nearestMeeting', function () {
		const meetings = this.get('model');
		const nearestMeetingDate = moment(this.get('nearestMeeting.plannedStart')).format();
		return meetings.filter(meeting => {
			let date = moment(meeting.plannedStart).format();

			if (date > nearestMeetingDate) {
				return meeting;
			}
		}).sortBy('plannedStart');
	}),

	filteredMeetings: computed('nearestMeeting', 'model', function () {
		const meetings = this.get('model');
		const nearestMeeting = this.get('nearestMeeting');
		const now = moment().format();

		let filteredMeetings = meetings.filter(meeting => meeting.id != nearestMeeting.id);
		return filteredMeetings.filter(meeting => {
			const date = moment(meeting.plannedStart).format();

			if (date < now) {
				return meeting;
			}
		});
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
		}
	}
});
