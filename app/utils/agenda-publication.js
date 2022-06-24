import CONSTANTS from 'frontend-kaleidos/config/constants';
import ENV from 'frontend-kaleidos/config/environment';

export const THEMIS_PUBLICATION_SCOPE_INITIAL = [
  CONSTANTS.THEMIS_PUBLICATION_SCOPES.NEWSITEMS,
  CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS,
];

const PROCESSING_WINDOW = Number.parseInt(ENV.APP.PUBLICATION_PROCESSING_WINDOW);
if (Number.isNaN(PROCESSING_WINDOW)) {
  console.error('please configure EMBER_PUBLICATION_PROCESSING_WINDOW', ENV.APP.PUBLICATION_PROCESSING_WINDOW);
}
export const PROCESSING_WINDOW_MS = PROCESSING_WINDOW * 1000;
const PROCESSING_MARGIN_MS = 60 * 1000; // 1 min

/**
 * Themis and document publication activities actual start date is a certain amount of time before their startDate attribute
 * This method determines whether the publication process is certainly not in progress or finished. It uses an extra margin.
 * @param {XPublicationActivity} xPublicationActivity
 * @returns {boolean}
 */
export function getIsCertainlyNotStarted(xPublicationActivity) {
  if (xPublicationActivity.startDate == null) {
      return true;
  }
  const minPublicationDate = new Date(Date.now() + PROCESSING_WINDOW_MS);
  const certainMinPublicationDate = new Date(minPublicationDate.getTime() + PROCESSING_MARGIN_MS);
  const isNotStartedMargin = certainMinPublicationDate < xPublicationActivity.startDate;
  return isNotStartedMargin;
}

export function getHasScope(themisPublicationActivity, scopeToMatch) {
  const scope = themisPublicationActivity.scope ?? []; // empty scope `[]` is returned as `undefined` when fetched
  let hasScope = scope.length === scopeToMatch.length;
  hasScope &&= scope.every((it) => scopeToMatch.includes(it));
  return hasScope;
}

export function getPlannedThemisPublicationActivity(themisPublicationActivities) {
  const possibleInitialActivities = themisPublicationActivities.filter((it) => {
      return getHasScope(it, THEMIS_PUBLICATION_SCOPE_INITIAL);
  });

  if (possibleInitialActivities.length === 0) {
    return undefined; // legacy data
  } else if (possibleInitialActivities.length === 1) {
    return possibleInitialActivities[0];
  } else {
    const firstScheduledActivity = possibleInitialActivities.sortBy('startDate')[0];
    return firstScheduledActivity;
  }
}
