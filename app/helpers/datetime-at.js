import { helper } from '@ember/component/helper';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';

export default helper(function datetimeAt([datetimeOrString, at="om"]) {
  return dateFormat(datetimeOrString, `dd-MM-yyyy ${at} HH:mm`);
});
