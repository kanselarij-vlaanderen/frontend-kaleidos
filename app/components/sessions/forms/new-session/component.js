import Component from '@ember/component';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';
import moment from 'moment';

export default Component.extend({
	store: inject(),
	today: moment.now(),
	classNames: ['new-session-form-container'],

	actions: {
		createNewSession() {
			let session = EmberObject.create({
					plannedstart: this.get('startDate'),
					number: "5"
			})

			let newSession = this.store.createRecord('session',session)
			newSession.save();
		},
		selectStartDate(val) {
			this.set('startDate', val);
		}
	}
});
