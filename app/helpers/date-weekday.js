import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class DateWeekday extends Helper {
  @service intl;

  compute([date]) {
    const weekDays = [
      this.intl.t('sunday'),
      this.intl.t('monday'),
      this.intl.t('tuesday'),
      this.intl.t('wednesday'),
      this.intl.t('thursday'),
      this.intl.t('friday'),
      this.intl.t('saturday'),
    ];
    return weekDays[date.getDay()];
  }
}
