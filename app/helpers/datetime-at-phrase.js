import { helper } from '@ember/component/helper';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';

export default helper(function datetimeAtPhrase([datetimeOrString, at = "om"]) {
  return dateFormat(datetimeOrString, `d MMMM yyyy '${at}' HH:mm`);
});
