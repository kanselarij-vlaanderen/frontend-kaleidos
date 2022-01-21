import { DateTransform as BaseDateTransform } from '@ember-data/serializer/-private';
import moment from 'moment';

export default class DateTransform extends BaseDateTransform {
  serialize(date) {
    if (date instanceof Date && !isNaN(date)) {
      return moment(date).format('YYYY-MM-DD');
    } if (moment.isMoment(date)) {
      return date.format('YYYY-MM-DD');
    } else {
      return null;
    }
  }
}
