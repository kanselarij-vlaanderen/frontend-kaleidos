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
