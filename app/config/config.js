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

export const PUBLICATION_EMAIL = {
  OUTBOX: 'http://themis.vlaanderen.be/id/mail-folders/4296e6af-7d4f-423d-ba89-ed4cbbb33ae7',
};

export const KALEIDOS_START_DATE = new Date(2019, 9 /* =october */, 1);

export const PUBLICATION_PROCESSING_WINDOW = 30 * 60;
