import EmberObject from '@ember/object';
import invert from 'lodash.invert';
import CONSTANTS from 'frontend-kaleidos/config/constants';

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
      uri: CONSTANTS.FORMALLY_OK_STATUSES.FORMALLY_OK,
      classNames: 'vlc-agenda-items__status vlc-agenda-items__status--positive',
      approved: true,
      svg: {
        icon: 'check',
        color: 'success',
      },
    },
    {
      label: 'Formeel niet OK',
      uri: CONSTANTS.FORMALLY_OK_STATUSES.FORMALLY_NOT_OK,
      classNames: 'vlc-agenda-items__status auk-u-text-error auk-u-text-bold',
      svg: {
        icon: 'x',
        color: 'error',
      },
    },
    {
      label: 'Nog niet formeel OK',
      uri: CONSTANTS.FORMALLY_OK_STATUSES.NOT_YET_FORMALLY_OK,
      classNames: 'vlc-agenda-items__status auk-u-text-bold',
      svg: {
        icon: 'circle-question',
        color: '',
      },
    }
  ],
  latinAdverbialNumberals,
  numbersBylatinAdverbialNumberals,
});
