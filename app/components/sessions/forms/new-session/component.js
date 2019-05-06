
import Component from '@ember/component';
import { inject } from '@ember/service';
import $ from 'jquery';

export default Component.extend({
	store: inject(),
	today: new Date(),

	actions: {
		async createNewSession() {
			let newMeeting = this.store.createRecord('meeting', {
				plannedStart: this.get('startDate'),
				created: new Date()
			});

			newMeeting.save().then(async (meeting) => {
				let agenda = this.store.createRecord('agenda', {
					name: "Ontwerpagenda",
					createdFor: meeting,
					created: new Date(),
					modified: new Date()
        });

				await agenda.save();
				await $.get('/session-service/assignNewSessionNumbers');
				this.successfullyAdded();
			});
		},

		selectStartDate(val) {
			this.set('startDate', val);
		},

		cancelForm(event) {
			this.cancelForm(event);
		},

		successfullyAdded() {
			this.successfullyAdded();
		}
	}
});
