import { helper } from '@ember/component/helper';
import { format } from 'date-fns';

export default helper(function datetimeAt([datetime, at="om"]) {
  if (datetime) {
    return format(datetime, `dd-MM-yyyy '${at}' HH:mm`);
  }
});
