import EmberObject from '@ember/object';

export default EmberObject.create({
  alphabet: [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ],
  // TODO translate
  notaID: '9e5b1230-f3ad-438f-9c68-9d7b1b2d875d',
  notaCaseTypeID: '1b6a6975-28e7-46b5-83fe-da37bb967db2',
  decisionDocumentTypeId: '2b73f8e2-b1f8-4cbd-927f-30c91759f08b',
  minuteDocumentTypeId: 'e149294e-a8b8-4c11-83ac-6d4c417b079b',
  remarkId: '305E9678-8106-4C14-9BD6-60AE2032D794',
  mail: {
    defaultFromAddress: 'noreply@vlaanderen.be',
    translationRequest: {
      content: 'Collega’s\n\nIn bijlage voor vertaling ons dossier (publicatienummer):\n\n%%titel%%\nLimiet vertaling:\nAantal bladzijden:\nAantal woorden:\n\n\n\nVriendelijke groeten,\n\nTeam OVRB\n\n[%%kaleidosenvironment%%]',
      subject: '[%%kaleidosenvironment%%] Vertaalaanvraag (%%nummer%%)',
    },
    publishPreviewRequest: {
      content: 'Beste,\n\nIn bijlage voor drukproef ons dossier (%%nummer%%):\n\n(%%titel%%)\n\nVriendelijke groeten,\n\nTeam OVRB\n\n[%%kaleidosenvironment%%]',
      subject: '[%%kaleidosenvironment%%] Dossier (%%nummer%%) – drukproef aub',
    },
    publishRequest: {
      content: 'Beste,\n\nVoor publicatie %%nummer%%.\n\nVriendelijke groeten,\n\nTeam OVRB\n\n[%%kaleidosenvironment%%]',
      subject: '[%%kaleidosenvironment%%] Aanvraag publicatie (%%numac%%)',
    },
  },
  formallyOkOptions: [
    {
      label: 'Formeel OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/CC12A7DB-A73A-4589-9D53-F3C2F4A40636',
      classNames: 'vlc-agenda-items__status vlc-agenda-items__status--positive vl-u-display-flex',
      approved: true,
      pillClassNames: 'vlc-pill vlc-pill--success',
      iconClassNames: 'ki-check formally-ok-icon',
    },
    {
      label: 'Formeel niet OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/92705106-4A61-4C30-971A-55532633A9D6',
      classNames: 'vlc-agenda-items__status vl-u-text--error vlc-u-font-weight-500 vl-u-display-flex',
      pillClassNames: 'vlc-pill vlc-pill--error',
      iconClassNames: 'ki-cross formally-ok-icon',
    },
    {
      label: 'Nog niet formeel OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/B72D1561-8172-466B-B3B6-FCC372C287D0',
      classNames: 'vlc-agenda-items__status vlc-u-font-weight-500  vl-u-display-flex',
      pillClassNames: 'vlc-pill',
      iconClassNames: 'ki-question-mark formally-ok-icon',
    }
  ],
  defaultKindUri:
    'http://kanselarij.vo.data.gift/id/concept/ministerraad-type-codes/A5D6B7A8-2F9C-44B6-B3BE-98D80B426254',
  kinds: [
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
  notYetFormallyOk:
    'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/B72D1561-8172-466B-B3B6-FCC372C287D0',
  formallyNok:
    'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/92705106-4A61-4C30-971A-55532633A9D6',
  formallyOk:
    'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/CC12A7DB-A73A-4589-9D53-F3C2F4A40636',

  latinAdverbialNumberals: {
    1: '',
    2: 'bis',
    3: 'ter',
    4: 'quater',
    5: 'quinquies',
    6: 'sexies',
    7: 'septies',
    8: 'octies',
    9: 'novies',
    10: 'decies',
    11: 'undecies',
    12: 'duodecies',
    13: 'ter decies',
    14: 'quater decies',
    15: 'quindecies',
  },
  adminId: '71c068e6-d2f0-43de-93ab-cd1e7156ac4b',
  kanselarijId: '50f4c79c-902d-4ad2-bca1-0f37a69f0c13',
  priviligedId: '3e824494-bbe7-45cf-aed8-5828970a10dc', // TODO: Rename to overheidId?
  ministerId: '1cc0710c-1b28-4e23-b3ff-399c8089bc71',
  kabinetId: '7e8c0c9c-05ec-49fd-9e96-fc54ebf3f9eb',
  usersId: '450915b2-4c64-4b03-9caa-71180400f831',
  ovrbId: '600d9d07-3368-4e6b-abbb-f5be5c2531a5',
  internRegeringAccessLevelId: 'd335f7e3-aefd-4f93-81a2-1629c2edafa3',
  internOverheidAccessLevelId: 'abe4c18d-13a9-45f0-8cdd-c493eabbbe29',
  publiekAccessLevelId: '6ca49d86-d40f-46c9-bde3-a322aa7e5c8e',
  mockLoginServiceProvider: 'https://github.com/kanselarij-vlaanderen/mock-login-service',
  developerWhitelistIds: {
    frederik: 'fa59bba0-52e3-11ea-8bfc-e35431e140ef',
    ben: '58177460-4e4a-11ea-a1d0-a99143fe0685',
    rafael: 'cbdd9b60-3b97-11ea-a194-f970e0c7187e',
  },
  agendaStatusDesignAgenda: {
    id: '2735d084-63d1-499f-86f4-9b69eb33727f',
    uri: 'http://kanselarij.vo.data.gift/id/agendastatus/2735d084-63d1-499f-86f4-9b69eb33727f',
  },
  agendaStatusClosed: {
    id: 'f06f2b9f-b3e5-4315-8892-501b00650101',
    uri: 'http://kanselarij.vo.data.gift/id/agendastatus/f06f2b9f-b3e5-4315-8892-501b00650101',
  },
  agendaStatusApproved: {
    id: 'ff0539e6-3e63-450b-a9b7-cc6463a0d3d1',
    uri: 'http://kanselarij.vo.data.gift/id/agendastatus/ff0539e6-3e63-450b-a9b7-cc6463a0d3d1',
  },
  DECISION_RESULT_CODE_URIS: {
    GOEDGEKEURD: 'http://kanselarij.vo.data.gift/id/concept/beslissings-resultaat-codes/56312c4b-9d2a-4735-b0b1-2ff14bb524fd',
    UITGESTELD: 'http://kanselarij.vo.data.gift/id/concept/beslissings-resultaat-codes/a29b3ffd-0839-45cb-b8f4-e1760f7aacaa',
    KENNISNAME: 'http://kanselarij.vo.data.gift/id/concept/beslissings-resultaat-codes/9f342a88-9485-4a83-87d9-245ed4b504bf',
    INGETROKKEN: 'http://kanselarij.vo.data.gift/id/concept/beslissings-resultaat-codes/453a36e8-6fbd-45d3-b800-ec96e59f273b',
  },
  publicationStatusToPublish: {
    id: 'fa62e050-3960-440d-bed9-1c3d3e9923a8',
    uri: 'http://kanselarij.vo.data.gift/id/concept/publicatie-statussen/fa62e050-3960-440d-bed9-1c3d3e9923a8',
  },
  publicationStatusPublished: {
    id: '2f8dc814-bd91-4bcf-a823-baf1cdc42475',
    uri: 'http://kanselarij.vo.data.gift/id/concept/publicatie-statussen/2f8dc814-bd91-4bcf-a823-baf1cdc42475',
  },
  LANGUAGE_NL: {
    uri: 'http://publications.europa.eu/resource/authority/language/NLD',
  },
  LANGUAGE_FR: {
    uri: 'http://publications.europa.eu/resource/authority/language/FRA',
  },
  LANGUAGE_DE: {
    uri: 'http://publications.europa.eu/resource/authority/language/DEU',
  },
  ACTIVITY_TYPES: {
    vertalen: {
      url: 'http://kanselarij.vo.data.gift/id/concept/activiteit-types/e9a532a5-65c1-484f-9288-1720dcd1296c',
      id: 'e9a532a5-65c1-484f-9288-1720dcd1296c',
    },
    handtekenen: {
      url: 'http://kanselarij.vo.data.gift/id/concept/activiteit-types/6a43f78e-c835-40a2-bf32-81209ac6e42a',
      id: '6a43f78e-c835-40a2-bf32-81209ac6e42a',
    },
    drukproeven: {
      url: 'http://kanselarij.vo.data.gift/id/concept/activiteit-types/165a56c5-6d32-4a8e-aefe-a1755eb0c0a4',
      id: '165a56c5-6d32-4a8e-aefe-a1755eb0c0a4',
    },
    publiceren: {
      url: 'http://kanselarij.vo.data.gift/id/concept/activiteit-types/fa62e050-3960-440d-bed9-1c3d3e9923a8',
      id: 'fa62e050-3960-440d-bed9-1c3d3e9923a8',
    },
  },
  ACTIVITY_STATUSSES: {
    open: {
      url: 'http://kanselarij.vo.data.gift/id/concept/activity-types/917349a2-4361-11eb-b378-0242ac130002',
      id: '917349a2-4361-11eb-b378-0242ac130002',
    },
    withdrawn: {
      url: 'http://kanselarij.vo.data.gift/id/concept/activity-types/b26eb1a0-4361-11eb-b378-0242ac130002',
      id: 'b26eb1a0-4361-11eb-b378-0242ac130002',
    },
    closed: {
      url: 'http://kanselarij.vo.data.gift/id/concept/activity-types/a6f7b9f2-4361-11eb-b378-0242ac130002',
      id: 'a6f7b9f2-4361-11eb-b378-0242ac130002',
    },
  },
  SUBCASE_TYPES: {
    vertalen: {
      id: 'd25ac65a-34a9-11eb-adc1-0242ac120002',
      url: 'http://example.com/step/d25ac65a-34a9-11eb-adc1-0242ac120002',
    },
    handtekenen: {
      id: 'e711f906-34a9-11eb-adc1-0242ac120002',
      url: 'http://example.com/step/e711f906-34a9-11eb-adc1-0242ac120002',
    },
    drukproef: {
      id: 'ef78bb52-34a9-11eb-adc1-0242ac120002',
      url: 'http://example.com/step/ef78bb52-34a9-11eb-adc1-0242ac120002',
    },
    publicatieBS: {
      id: 'ec5877b7-737b-4051-9b8b-abd177b61236',
      url: 'http://example.com/step/ec5877b7-737b-4051-9b8b-abd177b61236',
    },
  },
  PUBLICATION_TYPES: {
    extenso: {
      uri: 'http://kanselarij.vo.data.gift/id/concept/publicatie-types/5fcca4a7-3e1f-44ec-b854-e21ad092c524',
      id: '5fcca4a7-3e1f-44ec-b854-e21ad092c524',
    },
    bijUitreksel: {
      uri: 'http://kanselarij.vo.data.gift/id/concept/publicatie-types/5423c83d-ae5c-4973-8cb7-baefdc3e4949',
      id: '5423c83d-ae5c-4973-8cb7-baefdc3e4949',
    },
  },
});
