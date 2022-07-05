import CONSTANTS from 'frontend-kaleidos/config/constants';
import ENV from 'frontend-kaleidos/config/environment';

/**
 * @typedef {'newsitems'|'documents'} ThemisPublicationScopeEntry
 */

export const THEMIS_PUBLICATION_SCOPES = CONSTANTS.THEMIS_PUBLICATION_SCOPES;

export const THEMIS_PUBLICATION_SCOPE_PLANNED = [
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

export function getMostCertainPublicationTime(xPublicationActivity) {
  return xPublicationActivity?.plannedPublicationTime ?? xPublicationActivity?.unconfirmedPublicationTime;
}

/**
 * Gets the plannedPublicationTime if possible, falls back to unconfirmedPublicationTime
 * When an depublication operation has took place, returns undefined
 * @param {ThemisPublicationActivity[]} themisPublicationActivities
 * @param {ThemisPublicationScopeEntry[]} scopeEntries
 * @returns {Date|undefined}
 */
export function getFinalMostCertainPublicationTime(themisPublicationActivities, scopeEntries) {
  themisPublicationActivities = themisPublicationActivities.sortBy('plannedPublicationTime').reverse();
  for (let themisPublicationActivity of themisPublicationActivities) {
    if (getIsDepublication(themisPublicationActivity)) return undefined; // because it will undo previous publications
    if (scopeEntries == null || getHasInScope(themisPublicationActivity, scopeEntries)) {
      return getMostCertainPublicationTime(themisPublicationActivity);
    }
  }
}

export function getHasScope(themisPublicationActivity, scopeToMatch) {
  const scope = themisPublicationActivity.scope;
  let hasScope = scope.length === scopeToMatch.length;
  hasScope &&= scopeToMatch.every((it) => scope.includes(it));
  return hasScope;
}

export function getIsDepublication(themisPublicationActivity) {
  return getHasInScope(themisPublicationActivity, []);
}

export function getHasInScope(themisPublicationActivity, subjects) {
  return subjects.every((subject) => themisPublicationActivity.scope.includes(subject));
}

export function getPlannedThemisPublicationActivity(themisPublicationActivities) {
  const possibleInitialActivities = themisPublicationActivities.filter((it) => {
    return getHasScope(it, THEMIS_PUBLICATION_SCOPE_PLANNED);
  });

  if (possibleInitialActivities.length === 0) {
    return undefined; // old data | < KAS-3431
  }

  return possibleInitialActivities.sortBy('plannedPublicationTime')[0];
}
