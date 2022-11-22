import { helper } from '@ember/component/helper';
import { format } from 'date-fns';
import { dateHelper } from 'frontend-kaleidos/utils/date-helper';

export default helper(function datetime([datetimeOrString]) {
  const datetimeObject = dateHelper(datetimeOrString);
  if (datetimeObject) {
    return format(datetimeObject, 'dd-MM-yyyy HH:mm')
  }
});
