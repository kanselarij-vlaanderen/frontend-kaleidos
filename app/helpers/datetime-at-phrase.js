import { helper } from '@ember/component/helper';
import { format } from 'date-fns';
import { dateHelper } from 'frontend-kaleidos/utils/date-helper';

export default helper(function datetimeAtPhrase([datetimeOrString, at="om"]) {
  const datetimeObject = dateHelper(datetimeOrString);
  if (datetimeObject) {
    return format(datetimeObject, `d MMMM yyyy '${at}' HH:mm`);
  }
});
