import { DateTransform as BaseDateTransform } from '@ember-data/serializer/-private';
import moment from 'moment';

export default class DatetimeTransform extends BaseDateTransform {
  serialize(date) {
    if (moment.isMoment(date)) {
      return date.format();
    } else {
      return super.serialize(...arguments);
    }
  }
}
