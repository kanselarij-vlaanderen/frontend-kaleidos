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

/**
 * Themis and document publication activities actual start date is a certain amount of time before their plannedPublicationTime attribute
 * This method determines whether the publication process is not in progress or finished.
 * @param {XPublicationActivity} xPublicationActivity
 * @returns {boolean}
 */
export function getIsNotStarted(xPublicationActivity) {
  if (xPublicationActivity.plannedPublicationTime == null) return true;
  const minPublicationDate = new Date(Date.now() + PROCESSING_WINDOW_MS);
  const isNotStarted = minPublicationDate < xPublicationActivity.plannedPublicationTime;
  return isNotStarted;
}

export function getIsPublished(xPublicationActivity) {
  const now = new Date();
  return xPublicationActivity.plannedPublicationTime != null && xPublicationActivity.plannedPublicationTime < now;
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
    const firstScheduledActivity = possibleInitialActivities.sortBy('plannedPublicationTime')[0];
    return firstScheduledActivity;
  }
}
