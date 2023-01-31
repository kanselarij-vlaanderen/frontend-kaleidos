import { helper } from '@ember/component/helper';
import { isAfter, startOfDay } from 'date-fns';

export default helper(function isAfterDays([date]) {
  return isAfter(startOfDay(new Date()), startOfDay(date));
});
