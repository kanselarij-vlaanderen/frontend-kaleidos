import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	classNames:["vl-input-group","vl-datepicker"],

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
