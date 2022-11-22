import { helper } from '@ember/component/helper';
import { format } from 'date-fns';
import { dateHelper } from 'frontend-kaleidos/utils/date-helper';

export default helper(function time([timeOrString]) {
  const timeObject = dateHelper(timeOrString);
  if (timeObject) {
    return format(timeObject, 'HH:mm');
  }
});
