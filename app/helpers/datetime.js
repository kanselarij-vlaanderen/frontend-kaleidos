import { helper } from '@ember/component/helper';
import { format } from 'date-fns';

export default helper(function datetime([datetime]) {
  if (datetime) {
    return format(datetime, 'dd-MM-yyyy HH:mm')
  }
});
