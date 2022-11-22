import { helper } from '@ember/component/helper';
import { format } from 'date-fns';
import { dateHelper } from 'frontend-kaleidos/utils/date-helper';

export default helper(function datetimeAt([datetimeOrString, at="om"]) {
  const datetimeObject = dateHelper(datetimeOrString);
  if (datetimeObject) {
    return format(datetimeObject, `dd-MM-yyyy '${at}' HH:mm`);
  }
});
