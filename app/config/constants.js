export default {
  // GENERAL
  CONCEPT_SCHEMES: {
    BELEIDSDOMEIN: 'http://themis.vlaanderen.be/id/concept-scheme/f4981a92-8639-4da4-b1e3-0e1371feaa81',
    BELEIDSVELD: 'http://themis.vlaanderen.be/id/concept-scheme/0012aad8-d6e5-49e2-af94-b1bebd484d5b',
    VERGADERACTIVITEIT: 'http://themis.vlaanderen.be/id/concept-scheme/8030c0c4-aff1-4548-92d9-3299ebc43832',
    ACCESS_LEVELS: 'http://themis.vlaanderen.be/id/concept-scheme/9b354d36-250b-43d7-887c-db28fe2fc6fb',
    RELEASE_STATUSES: 'http://themis.vlaanderen.be/id/concept-scheme/49c93ef8-ca21-4ff9-b6d3-8351b410b563',
    AGENDA_ITEM_TYPES: 'http://themis.vlaanderen.be/id/concept-scheme/55c9120c-6a3d-49c4-80c8-ed01e9b92a9b',
    USER_ROLES: 'http://themis.vlaanderen.be/id/concept-scheme/b18acf1a-2a37-4b42-a549-b158d0065092',
    DOCUMENT_TYPES: 'http://themis.vlaanderen.be/id/concept-scheme/559774e3-061c-4f4b-a758-57228d4b68cd',
    DECISION_RESULT_CODES: 'http://themis.vlaanderen.be/id/concept-scheme/43052680-1c88-47f1-b081-99087afc4497',
    SIGNFLOW_STATUSES: 'http://themis.vlaanderen.be/id/concept-scheme/ebfe253c-0537-11ee-bb35-ee395168dcf7',
    PARLIAMENT_FLOW_STATUSES: 'http://themis.vlaanderen.be/id/concept-scheme/bfa3671b-68c1-4371-aa00-63840b7c9901',
  },
  ACCESS_LEVELS: {
    INTERN_SECRETARIE: 'http://themis.vlaanderen.be/id/concept/toegangsniveau/66804c35-4652-4ff4-b927-16982a3b6de8',
    VERTROUWELIJK: 'http://themis.vlaanderen.be/id/concept/toegangsniveau/9692ba4f-f59b-422b-9402-fcbd30a46d17',
    INTERN_REGERING: 'http://themis.vlaanderen.be/id/concept/toegangsniveau/13ae94b0-6188-49df-8ecd-4c4a17511d6d',
    INTERN_OVERHEID: 'http://themis.vlaanderen.be/id/concept/toegangsniveau/634f438e-0d62-4ae4-923a-b63460f6bc46',
    PUBLIEK: 'http://themis.vlaanderen.be/id/concept/toegangsniveau/c3de9c70-391e-4031-a85e-4b03433d6266',
  },
  USER_ROLES: {
    ADMIN: 'http://themis.vlaanderen.be/id/gebruikersrol/9a969b13-e80b-424f-8a82-a402bcb42bc5',
    KANSELARIJ: 'http://themis.vlaanderen.be/id/gebruikersrol/ab39b02a-14a5-4aa9-90bd-e0fa268b0f3d',
    SECRETARIE: 'http://themis.vlaanderen.be/id/gebruikersrol/c2ef1785-bf28-458f-952d-aa40989347d2',
    OVRB: 'http://themis.vlaanderen.be/id/gebruikersrol/648a1ffe-1a26-4931-a329-18d26a91438f',
    KORT_BESTEK: 'http://themis.vlaanderen.be/id/gebruikersrol/ca20a872-7743-4998-b479-06b003f49daf',
    MINISTER: 'http://themis.vlaanderen.be/id/gebruikersrol/01ace9e0-f810-474e-b8e0-f578ff1e230d',
    KABINET_DOSSIERBEHEERDER: 'http://themis.vlaanderen.be/id/gebruikersrol/6bcebe59-0cb5-4c5e-ab40-ca98b65887a4',
    KABINET_MEDEWERKER: 'http://themis.vlaanderen.be/id/gebruikersrol/33dbca4a-7e57-41d2-a26c-aedef422ff84',
    OVERHEIDSORGANISATIE: 'http://themis.vlaanderen.be/id/gebruikersrol/06cfd67b-1637-47d3-811f-97aa23a83644',
    VLAAMS_PARLEMENT: 'http://themis.vlaanderen.be/id/gebruikersrol/12543581-7f02-4166-87d2-ab15ddfce642',
  },
  USER_ACCESS_STATUSES: {
    ALLOWED: 'http://themis.vlaanderen.be/id/concept/43ba4953-3484-4ec7-9741-6e709befc531',
    BLOCKED: 'http://themis.vlaanderen.be/id/concept/ffd0d21a-3beb-44c4-b3ff-06fe9561282a',
  },
  SERVICE_PROVIDERS: {
    MOCK_LOGIN: 'https://github.com/kanselarij-vlaanderen/mock-login-service',
  },
  LANGUAGES: {
    NL: 'http://publications.europa.eu/resource/authority/language/NLD',
    FR: 'http://publications.europa.eu/resource/authority/language/FRA',
    DE: 'http://publications.europa.eu/resource/authority/language/DEU',
  },
  DOCUMENT_TYPES: {
    NOTA: 'http://themis.vlaanderen.be/id/concept/document-type/f2b0f655-8ed7-4f61-8f2b-ca813de7a6ed',
    VISIENOTA: 'http://themis.vlaanderen.be/id/concept/document-type/8ae796bd-690a-4ed6-855c-c4572e883066',
    DECISION: 'http://themis.vlaanderen.be/id/concept/document-type/e807feec-1958-46cf-a558-3379b5add49e',
    MB: 'https://data.vlaanderen.be/id/concept/AardWetgeving/MinisterieelBesluit',
    DECREET: 'https://data.vlaanderen.be/id/concept/AardWetgeving/Decreet',
    BVR: 'https://data.vlaanderen.be/id/concept/AardWetgeving/BesluitVanDeVlaamseRegering',
    NOTULEN: 'http://themis.vlaanderen.be/id/concept/document-type/d638e0dc-c879-4a75-9485-9e6970a83d67',
    BESLISSINGSFICHE: 'http://themis.vlaanderen.be/id/concept/document-type/e807feec-1958-46cf-a558-3379b5add49e',
    ONTWERPDECREET: 'http://themis.vlaanderen.be/id/concept/document-type/8a1e048a-4b55-4a19-b1c0-c85dba09a15c',
    MEMORIE: 'http://themis.vlaanderen.be/id/concept/document-type/f036e016-268e-4611-8fee-77d2047b51d8',
    ADVIES_RVS: "http://themis.vlaanderen.be/id/concept/document-type/73d69df5-c3f3-43b2-aeae-5a24b56b376e",
    ADVIES_IF: "http://themis.vlaanderen.be/id/concept/document-type/351ba62d-eeff-4b08-b1e3-0a56d38116c4",
    ADVIES: "http://themis.vlaanderen.be/id/concept/document-type/fb931eff-38f2-4743-802b-4240c35b8b0c",
    ADVIES_AGO: "http://themis.vlaanderen.be/id/concept/document-type/9c043848-6a9f-4448-9794-600e40dee6d2",
    BEKRACHTIGING: "http://themis.vlaanderen.be/id/concept/document-type/609cf883-b52c-43fe-84b1-eed02527173b",
    BIJLAGE_TER_INZAGE: "http://themis.vlaanderen.be/id/concept/document-type/075bc7a9-75fd-423b-be88-571d3fa3d043",
  },
  JOB_STATUSSES: {
    RUNNING: 'http://vocab.deri.ie/cogs#Running',
    SUCCESS: 'http://vocab.deri.ie/cogs#Success',
    FAILED: 'http://vocab.deri.ie/cogs#Fail',
  },
  DECISION_REPORT_JOB_STATUSSES: {
      SCHEDULED: 'http://data.kaleidos.vlaanderen.be/report-generation-job-statuses/scheduled',
      ONGOING: 'http://data.kaleidos.vlaanderen.be/report-generation-job-statuses/ongoing',
      SUCCESS: 'http://data.kaleidos.vlaanderen.be/report-generation-job-statuses/success',
      FAILURE: 'http://data.kaleidos.vlaanderen.be/report-generation-job-statuses/failure',
  },
  SIGN_FLOW_JOB_STATUSSES: {
      SCHEDULED: "http://redpencil.data.gift/id/concept/JobStatus/scheduled",
      BUSY: "http://redpencil.data.gift/id/concept/JobStatus/busy",
      SUCCESS: "http://redpencil.data.gift/id/concept/JobStatus/success",
      FAILED: "http://redpencil.data.gift/id/concept/JobStatus/failed",
  },
  VP_JOB_STATUSES: {
    SCHEDULED: "http://redpencil.data.gift/id/concept/JobStatus/scheduled",
    BUSY: "http://redpencil.data.gift/id/concept/JobStatus/busy",
    SUCCESS: "http://redpencil.data.gift/id/concept/JobStatus/success",
    FAILED: "http://redpencil.data.gift/id/concept/JobStatus/failed",
  },
  SUBCASE_TYPES: {
    BEKRACHTIGING: 'http://themis.vlaanderen.be/id/concept/procedurestap-type/bdba2bbc-7af6-490b-98a8-433955cfe869',
    DEFINITIEVE_GOEDKEURING: 'http://themis.vlaanderen.be/id/concept/procedurestap-type/6f7d1086-7c02-4a80-8c60-5690894f70fc',
    PRINCIPIELE_GOEDKEURING: 'http://themis.vlaanderen.be/id/concept/procedurestap-type/7b90b3a6-2787-4b41-8a1d-886fc5abbb33',
  },
  // AGENDA
  ACCEPTANCE_STATUSSES: {
    NOT_YET_OK: 'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/B72D1561-8172-466B-B3B6-FCC372C287D0',
    NOT_OK: 'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/92705106-4A61-4C30-971A-55532633A9D6',
    OK: 'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/CC12A7DB-A73A-4589-9D53-F3C2F4A40636',
  },
  DECISION_RESULT_CODE_URIS: {
    GOEDGEKEURD: 'http://themis.vlaanderen.be/id/concept/beslissing-resultaatcodes/56312c4b-9d2a-4735-b0b1-2ff14bb524fd',
    UITGESTELD: 'http://themis.vlaanderen.be/id/concept/beslissing-resultaatcodes/a29b3ffd-0839-45cb-b8f4-e1760f7aacaa',
    KENNISNAME: 'http://themis.vlaanderen.be/id/concept/beslissing-resultaatcodes/9f342a88-9485-4a83-87d9-245ed4b504bf',
    INGETROKKEN: 'http://themis.vlaanderen.be/id/concept/beslissing-resultaatcodes/453a36e8-6fbd-45d3-b800-ec96e59f273b',
  },
  DECISION_RESULT_CODE_IDS: {
    GOEDGEKEURD: '56312c4b-9d2a-4735-b0b1-2ff14bb524fd',
    UITGESTELD: 'a29b3ffd-0839-45cb-b8f4-e1760f7aacaa',
    KENNISNAME: '9f342a88-9485-4a83-87d9-245ed4b504bf',
    INGETROKKEN: '453a36e8-6fbd-45d3-b800-ec96e59f273b',
  },
  AGENDA_STATUSSES: {
    APPROVED: 'http://themis.vlaanderen.be/id/concept/agenda-status/fff6627e-4c96-4be1-b483-8fefcc6523ca',
    DESIGN: 'http://themis.vlaanderen.be/id/concept/agenda-status/b3d8a99b-0a7e-419e-8474-4b508fa7ab91',
  },
  AGENDA_ITEM_TYPES: {
    NOTA: 'http://themis.vlaanderen.be/id/concept/agendapunt-type/dd47a8f8-3ad2-4d5a-8318-66fc02fe80fd',
    ANNOUNCEMENT: 'http://themis.vlaanderen.be/id/concept/agendapunt-type/8f8adcf0-58ef-4edc-9e36-0c9095fd76b0',
  },
  // PUBLICATIONS
  PUBLICATION_STATUSES: {
    STARTED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/fa62e050-3960-440d-bed9-1c3d3e9923a8',
    TRANSLATION_REQUESTED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/3f0d3d3f-cde4-411f-a370-23a4a6d7743d',
    TRANSLATION_RECEIVED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/e34302e7-fcb2-47a4-a97e-10e39625fcfc',
    PROOF_REQUESTED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/f930c630-b568-4b92-b786-8a0e7363362a',
    PROOF_RECEIVED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/5350f28c-ff91-4a8c-94e1-699e92c73704',
    PROOF_RECALLED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/68b7d72e-38fd-4c0b-849b-cd4ae466e986',
    PROOF_CORRECTED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/9d01b336-be99-467f-ae2e-12f3841ae765',
    PUBLICATION_REQUESTED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/0b650ee2-3e5f-40f9-8c0d-0dc54a7a5f65',
    PUBLISHED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/2f8dc814-bd91-4bcf-a823-baf1cdc42475',
    WITHDRAWN: 'http://themis.vlaanderen.be/id/concept/publicatie-status/9b9b0b5e-45c8-11eb-b378-0242ac130002',
    PAUSED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/bc294fde-45c8-11eb-b378-0242ac130002',
  },
  RELEASE_STATUSES: {
    PLANNED: 'http://themis.vlaanderen.be/id/concept/vrijgave-status/1bd5b05a-07af-46d3-827f-297f993b8b54',
    CONFIRMED: 'http://themis.vlaanderen.be/id/concept/vrijgave-status/5da73f0d-6605-493c-9c1c-0d3a71bf286a',
    RELEASED: 'http://themis.vlaanderen.be/id/concept/vrijgave-status/27bd25d1-72b4-49b2-a0ba-236ca28373e5',
  },
  // NOT ALL SIGNFLOW STATUSSES ARE SUPPORTED YET. UNCOMMENT WHEN ENABLED
  SIGNFLOW_STATUSES: {
    MARKED: 'http://themis.vlaanderen.be/id/handtekenstatus/f6a60072-0537-11ee-bb35-ee395168dcf7',
    PREPARED: 'http://themis.vlaanderen.be/id/handtekenstatus/1dd296c2-053a-11ee-bb35-ee395168dcf7',
    TO_BE_APPROVED: 'http://themis.vlaanderen.be/id/handtekenstatus/2fd72150-0538-11ee-bb35-ee395168dcf7',
    TO_BE_SIGNED: 'http://themis.vlaanderen.be/id/handtekenstatus/47508452-0538-11ee-bb35-ee395168dcf7',
    SIGNED: 'http://themis.vlaanderen.be/id/handtekenstatus/29d4e7d2-0539-11ee-bb35-ee395168dcf7',
    REFUSED: 'http://themis.vlaanderen.be/id/handtekenstatus/3128aae6-0539-11ee-bb35-ee395168dcf7',
    CANCELED: 'http://themis.vlaanderen.be/id/handtekenstatus/2d043722-053a-11ee-bb35-ee395168dcf7',
  },
  PARLIAMENT_FLOW_STATUSES: {
    INCOMPLETE: 'http://themis.vlaanderen.be/id/parlementaireaangelegenheid-status/d30fdd4d-ba47-437d-b72e-4bff02e8c3fb',
    COMPLETE: 'http://themis.vlaanderen.be/id/parlementaireaangelegenheid-status/018fb31c-44ad-4bf5-b01b-76de2d48abf4',
    BEING_HANDLED_BY_FP: 'http://themis.vlaanderen.be/id/parlementaireaangelegenheid-status/3905d9a1-c841-42fc-8a89-3b7d4ad61b4b',
    RECEIVED: 'http://themis.vlaanderen.be/id/parlementaireaangelegenheid-status/879aed2f-6efa-4d7b-ab1b-13cc406b1f92',
  },
  PARLIAMENT_CASE_URL_BASE: 'https://www.vlaamsparlement.be/nl/parlementaire-documenten/parlementaire-initiatieven/',
  URGENCY_LEVELS: {
    SPEEDPROCEDURE: 'http://themis.vlaanderen.be/id/concept/urgentieniveau/b2b9c588-e91d-4ce0-a1a1-11b522e8a9bf',
    STANDARD: 'http://themis.vlaanderen.be/id/concept/urgentieniveau/5a48d953-3d88-4eb6-b784-ddb3070c831d',
  },
  SCHEMA_AGENCIES: {
    NUMAC: 'Belgisch Staatsblad',
    OVRB: 'ovrb',
  },
  STAATSBLAD_ELI_DOMAIN: 'http://www.ejustice.just.fgov.be/eli/',
  THEMIS_PUBLICATION_SCOPES: {
    NEWSITEMS: 'newsitems',
    DOCUMENTS: 'documents'
  },
  REGULATION_TYPES:{
    MB: 'http://themis.vlaanderen.be/id/concept/regelgeving-type/49bad4d9-745b-4a71-b6c6-0eac34e6bdd4',
    DECREET: 'http://themis.vlaanderen.be/id/concept/regelgeving-type/bf6101a9-d06b-44d4-b629-13965654c8c2',
    BVR: 'http://themis.vlaanderen.be/id/concept/regelgeving-type/ea7f5f79-f81c-459b-a0f7-d8e90e2d9b88',
  },
  MEETING_KINDS: {
    MINISTERRAAD: 'http://themis.vlaanderen.be/id/concept/vergaderactiviteit-type/ef51c9d5-8b45-4501-9dcd-3e00ccff524f',
    PVV: 'http://themis.vlaanderen.be/id/concept/vergaderactiviteit-type/9b4701f8-a136-4009-94c6-d64fdc96b9a2',
    ANNEX: 'http://themis.vlaanderen.be/id/concept/vergaderactiviteit-type/30d6a064-8cca-4485-8b37-7ab2357d931d',
    EP: 'http://themis.vlaanderen.be/id/concept/vergaderactiviteit-type/2387564a-0897-4a62-9b9a-d1755eece7af',
  },
  MANDATE_ROLES: {
    MINISTER_PRESIDENT: 'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03de', // Minister-president
    MINISTER: 'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03e0', // Minister
    VOORZITTER: 'http://themis.vlaanderen.be/id/bestuursfunctie/60d0dc2ab1838d01fca7db65', // Voorzitter
    GEMEENSCHAPSMINISTER: 'http://themis.vlaanderen.be/id/bestuursfunctie/60d0dc2ab1838d01fca7db67', // Gemeenschapsminister
    VICEMINISTER_PRESIDENT: 'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03df', // Viceminister-president
    SECRETARIS: 'http://themis.vlaanderen.be/id/bestuursfunctie/9d5ebfb9-3829-4b1f-a2a8-15033f7e2097',
    WAARNEMEND_SECRETARIS: 'http://themis.vlaanderen.be/id/bestuursfunctie/cfa6ed74-bb6f-4d4c-b905-9a205be135d7',
  },
  // TODO replace harcoded strings with constants for plausible
  PLAUSIBLE_EVENTS: {
    SEARCH_RESULT_KLIK: 'Zoekresultaat klik',
    SEARCH_TRIGGER: 'Zoekopdracht',
    SEARCH_ALL_TYPES_RESULTS_LINK: 'Alle inhoud resultaten link',
    USER_SESSION: 'Gebruikerssessie (per rol)',
    USER_LOGIN: 'Aanmelding (per rol)',
    USER_PAGEVIEW: 'Pageview (per rol)',
    FIRST_ACTION: 'Eerste actie',
    COPY_SUBCASE_CLICK: 'Kopieer voorgaande procedurestap',
  }
};
