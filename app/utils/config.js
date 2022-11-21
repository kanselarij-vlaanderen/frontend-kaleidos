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
      iconClassNames: 'ki-x formally-ok-icon',
      svg: {
        icon: 'x',
        color: 'danger',
      },
    },
    {
      label: 'Nog niet formeel OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/B72D1561-8172-466B-B3B6-FCC372C287D0',
      classNames: 'vlc-agenda-items__status auk-u-text-bold auk-o-flex',
      iconClassNames: 'ki-circle-question formally-ok-icon',
      svg: {
        icon: 'circle-question',
        color: '',
      },
    }
  ],
  latinAdverbialNumberals,
  numbersBylatinAdverbialNumberals,
});
