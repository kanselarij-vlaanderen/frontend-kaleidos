import { helper } from '@ember/component/helper';
import { format } from 'date-fns';

export default helper(function date([date]) {
  if (date) {
    return format(date, 'dd-MM-yyyy');
  }
});
