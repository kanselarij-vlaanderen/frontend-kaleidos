import { helper } from '@ember/component/helper';
import moment from 'moment';

const formatDate = (date) => {
  if (!date) {
    return '';
  }
  return moment(date)
    .utc()
    .format('DD MMMM YYYY');
}

export function subcaseTimelineItemText(params, values) {
  const label = values.phase.label || '';
  const phaseDate = values.phase.date;
  let textToShow = `${label}`
  if (phaseDate) {
    textToShow += ` ${formatDate(phaseDate)}`
  }
  return textToShow;
}

export default helper(subcaseTimelineItemText);
