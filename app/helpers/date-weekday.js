import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { format } from 'date-fns';

export default class DateWeekday extends Helper {
  @service intl;

  compute([date]) {
    return format(date, 'EEEE');
  }
}
