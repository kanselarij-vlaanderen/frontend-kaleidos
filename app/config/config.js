export const PAGE_SIZE = {
  PUBLICATION_FLOWS: 10,
  NOTAS: 50,
  PUBLICATION_FLOW_PIECES: 200,
  CODE_LISTS: 100,
  AGENDAITEMS: 300,
  PIECES: 500,
  ACTIVITIES: 500,
  CASES: 500,
  SELECT: 10,
  MANDATEES_IN_GOV_BODY: 300, // assumes max +- 20 gov body config changes for a 15-mandatee government (15 including doubles for vice-mp etc)
};

export const LIVE_SEARCH_DEBOUNCE_TIME = 300;

export const PUBLICATION_REPORT_START_YEAR = 1981;

export const PUBLICATION_EMAIL = {
  OUTBOX: 'http://themis.vlaanderen.be/id/mail-folders/4296e6af-7d4f-423d-ba89-ed4cbbb33ae7',
};

export const KALEIDOS_START_DATE = new Date(2019, 9 /* October */, 1);
export const PUBLICATIONS_IN_KALEIDOS_START_DATE = new Date(2022, 2 /* March */, 2);

// Number of milliseconds it takes to release a publication via Yggdrasil/Themis
export const ESTIMATED_PUBLICATION_DURATION = 30 * 60 * 1000;
export const PUBLICATION_ACTIVITY_REFRESH_INTERVAL_MS = 60 * 1000;

export const DOCUMENT_DELETE_UNDO_TIME_MS = 15000;

export const SUPPORTED_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
];
