import * as CONFIG from 'frontend-kaleidos/config/config';

const PUBLICATION_PROCESSING_WINDOW_MS = CONFIG.PUBLICATION_PROCESSING_WINDOW * 1000;
const PUBLICATION_PROCESSING_MARGIN_MS = 60 * 1000; // 1 min

/**
 * Themis and document publication activities actual start date is a certain amount of time before their startDate attribute
 * This method determines whether the publication process is certainly in progress or finished. It uses an extra margin.
 * @param {XPublicationActivity} xPublicationActivity
 * @returns {boolean}
 */
export function getIsCertainlyNotStarted(xPublicationActivity) {
  if (xPublicationActivity.startDate == null) {
      return true;
  }
  const minPublicationDate = new Date(Date.now() + PUBLICATION_PROCESSING_WINDOW_MS);
  const certainMinPublicationDate = new Date(minPublicationDate.getTime() + PUBLICATION_PROCESSING_MARGIN_MS);
  const isNotStartedMargin = certainMinPublicationDate < xPublicationActivity.startDate;
  return isNotStartedMargin;
}

export function getHasScope(themisPublicationActivity, scopeToMatch) {
  const scope = themisPublicationActivity.scope;
  let hasScope = scope.length === scopeToMatch.length;
  hasScope &&= scope.every((it) => scopeToMatch.includes(it));
  return hasScope;
}
