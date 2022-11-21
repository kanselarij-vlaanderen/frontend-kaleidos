import { helper } from '@ember/component/helper';
import { format } from 'date-fns';

export default helper(function dateFormat([date, formatString]) {
  if (date && formatString) {
    return format(date, formatString);
  }
});
