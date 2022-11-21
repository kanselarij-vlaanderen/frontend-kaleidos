import { helper } from '@ember/component/helper';
import { format } from 'date-fns';
import { nlBE } from 'date-fns/locale';

export default helper(function dateFormat([date, formatString]) {
  if (date && formatString) {
    return format(date, formatString, { locale: nlBE });
  }
});
