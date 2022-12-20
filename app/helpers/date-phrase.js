import { helper } from '@ember/component/helper';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';

export default helper(function datePhrase([dateOrString]) {
  return dateFormat(dateOrString, 'd MMMM yyyy');
});
