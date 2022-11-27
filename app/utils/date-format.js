import { format } from 'date-fns';

export function dateHelper(dateOrString, formatString) {
  if (formatString) {
    // new Date(null) returns a date representing the Unix epoch
    // This is undesired, we actually want an invalid date in that case
    const dateObject = new Date(dateOrString ?? NaN);
    if (!isNaN(dateObject.valueOf())) {
      return format(dateObject, formatString);
    }
  }
}
