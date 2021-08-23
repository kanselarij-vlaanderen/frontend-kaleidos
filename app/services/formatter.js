import Service from '@ember/service';
import moment from 'moment';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Service.extend({
  /**
   * @param date: if date is not empty it will be formatted, otherwise it returns                an empty date object.
   */
  formatDate(date) {
    if (!date) {
      return moment()
        .utc()
        .toDate();
    }
    return moment(date)
      .utc()
      .toDate();
  },
});
