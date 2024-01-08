import { helper } from '@ember/component/helper';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';

export default helper(function datetimeAtPhraseWeekday([datetimeOrString, at = "om"]) {
  return dateFormat(datetimeOrString, `EEEE d MMMM yyyy '${at}' HH:mm`);
});
