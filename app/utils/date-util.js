/**
 * Returns the most recent date from an array of dates.
 * Array may include blank values.
*/
export function getLatestDate(dates) {
  if (dates) {
    // Default JS .sort() of Date objects does not give expected results.
    // Sorting must compare millis.
    const sortedDates = dates.filter(date => date).sort((a, b) => b - a);
    const latest = sortedDates.firstObject;
    return latest;
  } else {
    return null;
  }
}

/**
 * Next day that's not in the weekend
 * LIMITATION: does not take holidays into account
 * @param {Date} date
 */
// eslint-disable-next-line prettier/prettier
export function getNextWorkday(date, hours = 0, minutes= 0, seconds = 0, milliseconds = 0) {
  /** JS: day counting logic Sunday=0, Monday=1,... */
  let day = date.getDay();
  const FRIDAY = 5;
  const SATURDAY = 6;
  let daysToNextWorkday;
  if (day === FRIDAY) {
    daysToNextWorkday = 3;
  } else if (day === SATURDAY) {
    daysToNextWorkday = 2;
  } else {
    daysToNextWorkday = 1;
  }

  // JS: When date is after end of month/year, date continues to the next month/year
  // eslint-disable-next-line prettier/prettier
  const nextWorkday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysToNextWorkday, hours, minutes, seconds, milliseconds);

  return nextWorkday;
}
