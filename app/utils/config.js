import EmberObject from '@ember/object';
import invert from 'lodash.invert';

const numbersBylatinAdverbialNumberals = {
  '': 1,
  bis: 2,
  ter: 3,
  quater: 4,
  quinquies: 5,
  sexies: 6,
  septies: 7,
  octies: 8,
  novies: 9,
  decies: 10,
  undecies: 11,
  duodecies: 12,
  'ter decies': 13,
  'quater decies': 14,
  quindecies: 15,
};
const latinAdverbialNumberals = invert(numbersBylatinAdverbialNumberals);

export default EmberObject.create({
  formallyOkOptions: [
    {
      label: 'Formeel OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/CC12A7DB-A73A-4589-9D53-F3C2F4A40636',
      classNames: 'vlc-agenda-items__status vlc-agenda-items__status--positive auk-o-flex',
      approved: true,
      pillClassNames: 'auk-pill auk-pill--success',
      iconClassNames: 'ki-check formally-ok-icon',
      svg: {
        icon: 'check',
        color: 'success',
      },
    },
    {
      label: 'Formeel niet OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/92705106-4A61-4C30-971A-55532633A9D6',
      classNames: 'vlc-agenda-items__status auk-u-text-error auk-u-text-bold auk-o-flex',
      pillClassNames: 'auk-pill auk-pill--danger',
      iconClassNames: 'ki-cross formally-ok-icon',
      svg: {
        icon: 'cross',
        color: 'danger',
      },
    },
    {
      label: 'Nog niet formeel OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/B72D1561-8172-466B-B3B6-FCC372C287D0',
      classNames: 'vlc-agenda-items__status auk-u-text-bold auk-o-flex',
      pillClassNames: 'auk-pill',
      iconClassNames: 'ki-question-mark formally-ok-icon',
      svg: {
        icon: 'question-mark',
        color: '',
      },
    }
  ],
  // TODO https://kanselarij.atlassian.net/browse/KAS-2430
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
  latinAdverbialNumberals,
  numbersBylatinAdverbialNumberals,
});
