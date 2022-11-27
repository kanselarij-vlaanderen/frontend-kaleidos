import { helper } from '@ember/component/helper';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';

export default helper(function date([dateOrString]) {
  return dateFormat(dateOrString, 'dd-MM-yyyy');
});
