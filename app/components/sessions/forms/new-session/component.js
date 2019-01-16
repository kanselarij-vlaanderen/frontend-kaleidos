import Component from '@ember/component';
import { inject } from '@ember/service';
import moment from 'moment';

export default Component.extend({
	store: inject(),
	today: moment.now(),
	classNames: ['new-session-form-container'],

	actions: {
		createNewSession() {
			let generatedNumber = Math.floor(Math.random() * Math.floor(2147000));
			let newSession = this.store.createRecord('session', {
				plannedstart: this.get('startDate'),
				number: generatedNumber,
			});

			newSession.save().then(session => {
				let agenda = this.store.createRecord('agenda', {
					name: "Ontwerpagenda",
					session: session
				});
				return agenda.save();
			});
			this.cancelForm();
		},
		selectStartDate(val) {
			this.set('startDate', val);
		},

		cancelForm(event) {
			this.cancelForm(event)
		}
	}
});
