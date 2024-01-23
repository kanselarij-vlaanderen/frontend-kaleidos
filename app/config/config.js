export const PAGE_SIZE = {
  PUBLICATION_FLOWS: 10,
  CODE_LISTS: 100,
  AGENDAITEMS: 300,
  PIECES: 500,
  SELECT: 10,
};

export const LIVE_SEARCH_DEBOUNCE_TIME = 300;

export const PAGINATION_SIZES = [5, 10, 20, 25, 50, 100, 200];

export const PUBLICATION_REPORT_START_YEAR = 1981;

export const PUBLICATION_EMAIL = {
  OUTBOX: 'http://themis.vlaanderen.be/id/mail-folders/4296e6af-7d4f-423d-ba89-ed4cbbb33ae7',
};

export const KALEIDOS_START_DATE = new Date(2019, 9 /* October */, 1);
export const PUBLICATIONS_IN_KALEIDOS_START_DATE = new Date(2022, 2 /* March */, 2);
export const DIGITAL_DECISIONS_IN_KALEIDOS_START_DATE = new Date(2023, 10 /* November */, 20);
export const DIGITAL_MINUTES_IN_KALEIDOS_START_DATE = new Date(2023, 10 /* November */, 20);

// Number of milliseconds it takes to release a publication via Yggdrasil/Themis
export const ESTIMATED_PUBLICATION_DURATION = 30 * 60 * 1000;
export const PUBLICATION_ACTIVITY_REFRESH_INTERVAL_MS = 60 * 1000;
export const SIGN_FLOW_STATUS_REFRESH_INTERVAL_MS = 60 * 1000;

export const DOCUMENT_DELETE_UNDO_TIME_MS = 15000;

export const DOCUMENT_CONVERSION_SUPPORTED_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
];
export const EMAIL_ATTACHMENT_WARN_SIZE = 10 * 1000000; // 10 MB
export const EMAIL_ATTACHMENT_MAX_SIZE = 30 * 1000000; // 30 MB
