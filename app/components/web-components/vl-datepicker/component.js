import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  formatter: inject(),
  classNames: ['vl-input-group', 'vl-datepicker'],
  dateObjectsToEnable: null,
  datePropertyToUse: null,

  datesToEnable: computed('dateObjectsToEnable', function() {
    const { dateObjectsToEnable, datePropertyToUse } = this;
    return dateObjectsToEnable.map(object => {
      return this.formatter.formatDate(object.get(datePropertyToUse));
    });
  }),

  selectedDate: computed('date', function() {
    const date = this.get('date');
    if (date) {
      return this.formatter.formatDate(date.get('firstObject'));
    } else {
      return this.formatter.formatDate(null);
    }
  }),

  actions: {
    toggleCalendar() {
      this.flatpickrRef.toggle();
    },

    dateChanged(val) {
      this.dateChanged(this.formatter.formatDate(val.get('firstObject')));
    }
  }
});
