import { helper } from '@ember/component/helper';
import { format } from 'date-fns';

export default helper(function datePhrase([date]) {
  if (date) {
    return format(date, 'd MMMM yyyy');
  }
});
