import CONSTANTS from 'frontend-kaleidos/config/constants';
import ENV from 'frontend-kaleidos/config/environment';

/**
 * @typedef {'newsitems'|'documents'} ThemisPublicationScopeEntry
 */

export const THEMIS_PUBLICATION_SCOPES = CONSTANTS.THEMIS_PUBLICATION_SCOPES;

export const THEMIS_PUBLICATION_SCOPE_NEWS_DOCS = [
  CONSTANTS.THEMIS_PUBLICATION_SCOPES.NEWSITEMS,
  CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS,
];

const PROCESSING_WINDOW = Number.parseInt(ENV.APP.PUBLICATION_PROCESSING_WINDOW);
if (Number.isNaN(PROCESSING_WINDOW)) {
  console.error('please configure EMBER_PUBLICATION_PROCESSING_WINDOW', ENV.APP.PUBLICATION_PROCESSING_WINDOW);
}
export const PROCESSING_WINDOW_MS = PROCESSING_WINDOW * 1000;

export function getMostCertainPublicationTime(xPublicationActivity) {
  return xPublicationActivity?.plannedPublicationTime;
}

/**
 * Gets the plannedPublicationTim
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
