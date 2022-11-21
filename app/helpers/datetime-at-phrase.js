import { helper } from '@ember/component/helper';
import { format } from 'date-fns';
import { nlBE } from 'date-fns/locale';

export default helper(function datetimeAtPhrase([datetime, at="om"]) {
  if (datetime) {
    return format(datetime, `d MMMM yyyy '${at}' HH:mm`, { locale: nlBE });
  }
});
