// import { format } from 'date-fns';
import { formatInTimeZone as format } from 'date-fns-tz';
import { nlBE } from 'date-fns/locale';

const timezone = 'Europe/Brussels';

export function dateFormat(dateOrString, formatString) {
  if (formatString) {
    // new Date(null) returns a date representing the Unix epoch
    // This is undesired, we actually want an invalid date in that case
    const dateObject = new Date(dateOrString ?? NaN);
    if (!isNaN(dateObject.valueOf())) {
      return format(dateObject, timezone, formatString, {
        locale: nlBE,
      });
    }
  }
}
