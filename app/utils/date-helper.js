export function dateHelper(dateOrString) {
  // new Date(null) returns a date representing the Unix epoch
  // This is undesired, we actually want an invalid date in that case
  const dateObject = new Date(dateOrString ?? NaN);
  return !isNaN(dateObject.valueOf()) ? dateObject : null;
}
