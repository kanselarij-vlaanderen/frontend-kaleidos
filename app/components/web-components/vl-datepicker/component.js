import Component from '@ember/component';

export default Component.extend({
	classNames:["vl-input-group","vl-datepicker"],

	actions: {
    toggleCalendar() {
      this.flatpickrRef.toggle();
		},
		
		dateChanged(val) {
			this.dateChanged(val.get('firstObject'));
		}
  }
});
