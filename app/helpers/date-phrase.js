import { helper } from '@ember/component/helper';
import { format } from 'date-fns';
import { dateHelper } from 'frontend-kaleidos/utils/date-helper';

export default helper(function datePhrase([dateOrString]) {
  const dateObject = dateHelper(dateOrString);
  if (dateObject) {
    return format(dateObject, 'd MMMM yyyy');
  }
});
