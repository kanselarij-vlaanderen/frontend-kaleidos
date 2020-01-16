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
    'Z',
  ],
  //TODO translate
  resultSubcaseName: '1ste principiële goedkeuring',
  principalApprovalId: '7b90b3a6-2787-4b41-8a1d-886fc5abbb33',
  onAgendaCodeId: '3e6dba4f-5c3c-439a-993e-92348ec73642',
  decidedCodeId: '4ea2c010-06c0-4594-966b-2cb9ed1e07b7',
  postponedCodeId: 'F8AB7F8C-2928-4CED-812F-80EF560F6E31',
  onAgendaLabel: 'geagendeerd',
  decidedLabel: 'beslist',
  postponedLabel: 'uitgesteld',
  notaID: '9e5b1230-f3ad-438f-9c68-9d7b1b2d875d',
  notaCaseTypeID: '1b6a6975-28e7-46b5-83fe-da37bb967db2',
  decisionDocumentTypeId: '2b73f8e2-b1f8-4cbd-927f-30c91759f08b',
  minuteDocumentTypeId: 'e149294e-a8b8-4c11-83ac-6d4c417b079b',
  remarkId: '305E9678-8106-4C14-9BD6-60AE2032D794',
  formallyOkOptions: [
    {
      label: 'Formeel OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/CC12A7DB-A73A-4589-9D53-F3C2F4A40636',
      classNames: 'vlc-agenda-items__status vlc-agenda-items__status--positive',
      approved: true,
      pillClassNames: 'vlc-pill vlc-pill--success',
    },
    {
      label: 'Formeel niet OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/92705106-4A61-4C30-971A-55532633A9D6',
      classNames: 'vlc-agenda-items__status vl-u-text--error',
      pillClassNames: 'vlc-pill vlc-pill--error',
    },
    {
      label: 'Nog niet formeel OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/B72D1561-8172-466B-B3B6-FCC372C287D0',
      classNames: 'vlc-agenda-items__status',
      pillClassNames: 'vlc-pill',
    },
  ],
  defaultKindUri:
    'http://kanselarij.vo.data.gift/id/concept/ministerraad-type-codes/A5D6B7A8-2F9C-44B6-B3BE-98D80B426254',
  kinds: [
    {
      label: 'Ministerraad',
      procedure: '',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/ministerraad-type-codes/A5D6B7A8-2F9C-44B6-B3BE-98D80B426254',
    },
    {
      label: 'Elektronische procedure',
      procedure: ' via elektronische procedure',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/ministerraad-type-codes/406F2ECA-524D-47DC-B889-651893135456',
    },
    {
      label: 'Bijzondere ministerraad',
      procedure: '',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/ministerraad-type-codes/7D8E35BE-E5D1-494F-B5F9-51B07875B96F',
    },
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
  adminId:"71c068e6-d2f0-43de-93ab-cd1e7156ac4b",
  kanselarijId:"50f4c79c-902d-4ad2-bca1-0f37a69f0c13",
  priviligedId:"3e824494-bbe7-45cf-aed8-5828970a10dc",
  ministerId:"1cc0710c-1b28-4e23-b3ff-399c8089bc71",
  kabinetId:"7e8c0c9c-05ec-49fd-9e96-fc54ebf3f9eb",
  usersId:"450915b2-4c64-4b03-9caa-71180400f831",
  internRegeringAccessLevelId: "d335f7e3-aefd-4f93-81a2-1629c2edafa3"
});
