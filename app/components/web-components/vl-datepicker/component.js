import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend({
	classNames: ["vl-input-group", "vl-datepicker"],
	dateObjectsToEnable: null,
	datePropertyToUse: null,

	datesToEnable: computed('dateObjectsToEnable', function () {
		const { dateObjectsToEnable, datePropertyToUse } = this;
		return dateObjectsToEnable.map((object) => {
			return moment(object.get(datePropertyToUse)).utc().toDate();
		})
	}),

	selectedDate: computed('date', function () {
		const date = this.get('date');
		if (date) {
			return date;
		} else {
			return moment().utc().toDate();
		}
	}),

	actions: {
		toggleCalendar() {
			this.flatpickrRef.toggle();
		},

		dateChanged(val) {
			this.dateChanged(val.get('firstObject'));
		}
	}
});
