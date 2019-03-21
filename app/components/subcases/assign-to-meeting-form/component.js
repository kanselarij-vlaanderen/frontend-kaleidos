import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';

export default Component.extend({
	store: inject(),

	dateObjectsToEnable: computed('store', function () {
		const dateOfToday = moment().format();
		return this.store.query('meeting', {
			filter: { ':gte:planned-start': dateOfToday }
		});
	}),

	actions: {
		selectStartDate(val) {
			this.set('startDate', val);
		},

		async assignToMeeting(subcase) {
			const { startDate, dateObjectsToEnable } = this;
			const meetings = await dateObjectsToEnable;

			const meetingToAssignTo = meetings.find(meeting =>
				moment(meeting.get('plannedStart')).format() == moment(startDate).format());

			const selectedSubcase = this.store.peekRecord('subcase', subcase.get('id'));
			if (selectedSubcase && meetingToAssignTo) {
				selectedSubcase.set('requestedForMeeting', meetingToAssignTo);
				selectedSubcase.save().then(() => {
					this.cancel();
				});
			}
		},

		cancel() {
			this.cancel();
		}
	}
});
