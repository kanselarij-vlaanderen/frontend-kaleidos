import { setDefaultOptions } from 'date-fns';
import { nlBE } from 'date-fns/locale';

export function initialize(appInstance) {
  // Set default locale for date-fns
  setDefaultOptions({ locale: nlBE });

  // Set default locale for intl
  const intl = appInstance.lookup('service:intl');
  intl.setLocale(['nl-be']);
}

export default {
  initialize
};
