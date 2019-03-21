import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	classNames:["vl-input-group","vl-datepicker"],
	dateObjectsToEnable:null,
	datePropertyToUse: null,

	datesToEnable: computed('dateObjectsToEnable', function() {
		const { dateObjectsToEnable, datePropertyToUse } = this;
		return dateObjectsToEnable.map((object) => {
			return new Date(object.get(datePropertyToUse));
		}) 
	}),

	selectedDate: computed('date', function() {
		const date = this.get('date');
		if(date) {
			return date;
		} else {
			return new Date();
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
