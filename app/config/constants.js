export default {
  // GENERAL
  ACCESS_LEVELS: {
    INTERN_REGERING: 'http://kanselarij.vo.data.gift/id/concept/toegangs-niveaus/d335f7e3-aefd-4f93-81a2-1629c2edafa3',
    INTERN_OVERHEID: 'http://kanselarij.vo.data.gift/id/concept/toegangs-niveaus/abe4c18d-13a9-45f0-8cdd-c493eabbbe29',
    PUBLIEK: 'http://kanselarij.vo.data.gift/id/concept/toegangs-niveaus/6ca49d86-d40f-46c9-bde3-a322aa7e5c8e',
  },
  ACCOUNT_GROUPS: {
    ADMIN: 'http://data.kanselarij.vlaanderen.be/id/group/admin',
    KANSELARIJ: 'http://data.kanselarij.vlaanderen.be/id/group/kanselarij',
    OVRB: 'http://data.kanselarij.vlaanderen.be/id/group/OVRB',
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
    DECREET: 'http://kanselarij.vo.data.gift/id/concept/document-type-codes/e4f73ddc-1ed6-4878-b9ed-ace55c0a8d64',
    DECISION_VR: 'http://kanselarij.vo.data.gift/id/concept/document-type-codes/4c7cfaf9-1d5f-4fdf-b7e9-b7ce5167e31a',
  },
  DOSSIER_TYPES: {
    NOTA: 'http://kanselarij.vo.data.gift/id/dossier-type-codes/1b6a6975-28e7-46b5-83fe-da37bb967db2',
    REMARK: 'http://kanselarij.vo.data.gift/id/dossier-type-codes/305E9678-8106-4C14-9BD6-60AE2032D794',
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
  // PUBLICATIONS
  PUBLICATION_STATUSES: {
    PENDING: 'http://themis.vlaanderen.be/id/concept/publicatie-status/fa62e050-3960-440d-bed9-1c3d3e9923a8',
    PUBLISHED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/2f8dc814-bd91-4bcf-a823-baf1cdc42475',
    PAUSED: 'http://themis.vlaanderen.be/id/concept/publicatie-status/bc294fde-45c8-11eb-b378-0242ac130002',
    WITHDRAWN: 'http://themis.vlaanderen.be/id/concept/publicatie-status/9b9b0b5e-45c8-11eb-b378-0242ac130002',
  },
  URGENCY_LEVELS: {
    SPEEDPROCEDURE: 'http://themis.vlaanderen.be/id/concept/urgentieniveau/b2b9c588-e91d-4ce0-a1a1-11b522e8a9bf',
    STANDARD: 'http://themis.vlaanderen.be/id/concept/urgentieniveau/5a48d953-3d88-4eb6-b784-ddb3070c831d',
  },
  SCHEMA_AGENCIES: {
    NUMAC: 'Belgisch Staatsblad',
    OVRB: 'ovrb',
  },
  // TODO refactor to right style
  MINISTERRAAD_TYPES: {
    DEFAULT: 'http://kanselarij.vo.data.gift/id/concept/ministerraad-type-codes/A5D6B7A8-2F9C-44B6-B3BE-98D80B426254',
    TYPES: [
      {
        label: 'Ministerraad',
        altLabel: 'Ministerraad',
        uri:
        'http://kanselarij.vo.data.gift/id/concept/ministerraad-type-codes/A5D6B7A8-2F9C-44B6-B3BE-98D80B426254',
      },
      {
        label: 'Elektronische procedure',
        altLabel: 'Ministerraad via elektronische procedure',
        uri:
        'http://kanselarij.vo.data.gift/id/concept/ministerraad-type-codes/406F2ECA-524D-47DC-B889-651893135456',
      },
      {
        label: 'Bijzondere ministerraad',
        altLabel: 'Bijzondere ministerraad',
        uri:
        'http://kanselarij.vo.data.gift/id/concept/ministerraad-type-codes/7D8E35BE-E5D1-494F-B5F9-51B07875B96F',
      },
      {
        label: 'Ministerraad - Plan Vlaamse Veerkracht',
        altLabel: 'Ministerraad - Plan Vlaamse Veerkracht',
        postfix: 'VV',
        uri:
        'http://kanselarij.vo.data.gift/id/concept/ministerraad-type-codes/1d16cb70-0ae9-489e-bf97-c74897222e3c',
      }
    ],
  },
};
