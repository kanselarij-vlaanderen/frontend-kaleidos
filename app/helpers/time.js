import { helper } from '@ember/component/helper';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';

export default helper(function time([timeOrString]) {
  return dateFormat(timeOrString, 'HH:mm');
});
