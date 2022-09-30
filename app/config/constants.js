export default {
  // GENERAL
  CONCEPT_SCHEMES: {
    BELEIDSDOMEIN: 'http://themis.vlaanderen.be/id/concept-schema/f4981a92-8639-4da4-b1e3-0e1371feaa81',
    BELEIDSVELD: 'http://themis.vlaanderen.be/id/concept-schema/0012aad8-d6e5-49e2-af94-b1bebd484d5b',
    VERGADERACTIVITEIT: 'http://themis.vlaanderen.be/id/concept-scheme/8030c0c4-aff1-4548-92d9-3299ebc43832',
    ACCESS_LEVELS: 'http://themis.vlaanderen.be/id/concept-scheme/9b354d36-250b-43d7-887c-db28fe2fc6fb',
    RELEASE_STATUSES: 'http://themis.vlaanderen.be/id/concept-scheme/49c93ef8-ca21-4ff9-b6d3-8351b410b563',
    AGENDA_ITEM_TYPES: 'http://themis.vlaanderen.be/id/concept-scheme/55c9120c-6a3d-49c4-80c8-ed01e9b92a9b',
  },
  ACCESS_LEVELS: {
    INTERN_SECRETARIE: 'http://themis.vlaanderen.be/id/concept/toegangsniveau/66804c35-4652-4ff4-b927-16982a3b6de8',
    VERTROUWELIJK: 'http://themis.vlaanderen.be/id/concept/toegangsniveau/9692ba4f-f59b-422b-9402-fcbd30a46d17',
    INTERN_REGERING: 'http://themis.vlaanderen.be/id/concept/toegangsniveau/13ae94b0-6188-49df-8ecd-4c4a17511d6d',
    INTERN_OVERHEID: 'http://themis.vlaanderen.be/id/concept/toegangsniveau/634f438e-0d62-4ae4-923a-b63460f6bc46',
    PUBLIEK: 'http://themis.vlaanderen.be/id/concept/toegangsniveau/c3de9c70-391e-4031-a85e-4b03433d6266',
  },
  ACCOUNT_GROUPS: {
    ADMIN: 'http://data.kanselarij.vlaanderen.be/id/group/admin',
    KANSELARIJ: 'http://data.kanselarij.vlaanderen.be/id/group/kanselarij',
    OVRB: 'http://data.kanselarij.vlaanderen.be/id/group/OVRB',
    KORT_BESTEK: 'http://data.kanselarij.vlaanderen.be/id/group/kort-bestek',
    MINISTER: 'http://data.kanselarij.vlaanderen.be/id/group/minister',
    KABINET: 'http://data.kanselarij.vlaanderen.be/id/group/kabinet',
    OVERHEID: 'http://data.kanselarij.vlaanderen.be/id/group/overheid',
    USER: 'http://data.kanselarij.vlaanderen.be/id/group/user',
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
    NOTA: 'http://kanselarij.vo.data.gift/id/concept/document-type-codes/9e5b1230-f3ad-438f-9c68-9d7b1b2d875d',
    VISIENOTA: 'http://kanselarij.vo.data.gift/id/concept/document-type-codes/52d8ce45-1954-48e7-9402-ac5ee3edbbc4',
    DECISION: 'http://kanselarij.vo.data.gift/id/concept/document-type-codes/2b73f8e2-b1f8-4cbd-927f-30c91759f08b',
    DECISION_VR: 'http://kanselarij.vo.data.gift/id/concept/document-type-codes/4c7cfaf9-1d5f-4fdf-b7e9-b7ce5167e31a',
    MB: 'https://data.vlaanderen.be/id/concept/AardWetgeving/MinisterieelBesluit',
    DECREET: 'https://data.vlaanderen.be/id/concept/AardWetgeving/Decreet',
    BVR: 'https://data.vlaanderen.be/id/concept/AardWetgeving/BesluitVanDeVlaamseRegering',
  },
  JOB_STATUSSES: {
    RUNNING: 'http://vocab.deri.ie/cogs#Running',
    SUCCESS: 'http://vocab.deri.ie/cogs#Success',
    FAILED: 'http://vocab.deri.ie/cogs#Fail',
  },
  SUBCASE_TYPES: {
    BEKRACHTIGING: 'http://example.com/step/bdba2bbc-7af6-490b-98a8-433955cfe869',
  },
  // AGENDA
  ACCEPTANCE_STATUSSES: {
    NOT_YET_OK: 'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/B72D1561-8172-466B-B3B6-FCC372C287D0',
    NOT_OK: 'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/92705106-4A61-4C30-971A-55532633A9D6',
    OK: 'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/CC12A7DB-A73A-4589-9D53-F3C2F4A40636',
  },
  DECISION_RESULT_CODE_URIS: {
    GOEDGEKEURD: 'http://kanselarij.vo.data.gift/id/concept/beslissings-resultaat-codes/56312c4b-9d2a-4735-b0b1-2ff14bb524fd',
    UITGESTELD: 'http://kanselarij.vo.data.gift/id/concept/beslissings-resultaat-codes/a29b3ffd-0839-45cb-b8f4-e1760f7aacaa',
    KENNISNAME: 'http://kanselarij.vo.data.gift/id/concept/beslissings-resultaat-codes/9f342a88-9485-4a83-87d9-245ed4b504bf',
    INGETROKKEN: 'http://kanselarij.vo.data.gift/id/concept/beslissings-resultaat-codes/453a36e8-6fbd-45d3-b800-ec96e59f273b',
  },
  AGENDA_STATUSSES: {
    CLOSED: 'http://kanselarij.vo.data.gift/id/agendastatus/f06f2b9f-b3e5-4315-8892-501b00650101',
    APPROVED: 'http://kanselarij.vo.data.gift/id/agendastatus/ff0539e6-3e63-450b-a9b7-cc6463a0d3d1',
    DESIGN: 'http://kanselarij.vo.data.gift/id/agendastatus/2735d084-63d1-499f-86f4-9b69eb33727f',
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
  },
  MANDATE_ROLES: {
    MINISTER_PRESIDENT: 'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03de', // Minister-president
    MINISTER: 'http://themis.vlaanderen.be/id/bestuursfunctie/5fed907ce6670526694a03e0', // Minister
    VOORZITTER: 'http://themis.vlaanderen.be/id/bestuursfunctie/60d0dc2ab1838d01fca7db65', // Voorzitter
    GEMEENSCHAPSMINISTER: 'http://themis.vlaanderen.be/id/bestuursfunctie/60d0dc2ab1838d01fca7db67', // Gemeenschapsminister
  }
};
