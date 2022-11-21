import { helper } from '@ember/component/helper';
import { format } from 'date-fns';

export default helper(function time([time]) {
  if (time) {
    return format(time, 'HH:mm');
  }
});
