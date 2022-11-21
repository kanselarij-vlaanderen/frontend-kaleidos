import { helper } from '@ember/component/helper';
import { format } from 'date-fns';

export default helper(function datetimeAtPhrase([datetime, at="om"]) {
  if (datetime) {
    return format(datetime, `d MMMM yyyy '${at}' HH:mm`);
  }
});
