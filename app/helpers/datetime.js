import { helper } from '@ember/component/helper';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';

export default helper(function datetime([datetimeOrString]) {
  return dateFormat(datetimeOrString, 'dd-MM-yyyy HH:mm');
});
