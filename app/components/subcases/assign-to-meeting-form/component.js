import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';

export default Component.extend({
	store: inject(),

	dateObjectsToEnable: computed(function () {
		return this.store.query('meeting', { sort: 'planned-start' });
	}),

	actions: {
		selectStartDate(val) {
			this.set('startDate', moment(val).utc().format());
		},

		async assignToMeeting(subcase) {
			const { startDate, dateObjectsToEnable } = this;
			const meetings = await dateObjectsToEnable;

			const meetingToAssignTo = meetings.find(meeting =>
				moment(meeting.get('plannedStart')).utc().format() == moment(startDate).utc().format());

			const selectedSubcase = await this.store.findRecord('subcase', subcase.get('id'));
			if (selectedSubcase && meetingToAssignTo) {
				await this.proposeForAgenda(selectedSubcase, meetingToAssignTo);
				this.cancel();
			}
		},

		cancel() {
			this.cancel();
		}
	},

});
