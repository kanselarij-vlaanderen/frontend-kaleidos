import { helper } from '@ember/component/helper';
import { dateFormat as dateFormatUtil } from 'frontend-kaleidos/utils/date-format';

export default helper(function dateFormat([dateOrString, formatString]) {
  return dateFormatUtil(dateOrString, formatString);
});
