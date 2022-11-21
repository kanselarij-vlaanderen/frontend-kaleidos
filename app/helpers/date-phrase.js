import { helper } from '@ember/component/helper';
import { format } from 'date-fns';
import { nlBE } from 'date-fns/locale';

export default helper(function datePhrase([date]) {
  if (date) {
    return format(date, 'd MMMM yyyy', { locale: nlBE });
  }
});
