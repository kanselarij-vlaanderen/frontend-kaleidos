import Service from '@ember/service';
import moment from 'moment';

export default Service.extend({
  /**
   * @param date: if date is not empty it will be formatted, otherwise it returns 								an empty date object.
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
  }
});
