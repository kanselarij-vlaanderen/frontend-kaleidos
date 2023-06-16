import Helper from '@ember/component/helper';
import { format } from 'date-fns';

export default class DateWeekday extends Helper {
  compute([date]) {
    return format(date, 'EEEE');
  }
}
