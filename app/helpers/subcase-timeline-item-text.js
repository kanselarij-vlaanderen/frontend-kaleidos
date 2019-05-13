import { helper } from '@ember/component/helper';
import moment from 'moment';

export function subcaseTimelineItemText(params, values) {
  const label = values.label;
  const phase = values.phase;
  switch (label.toLowerCase()) {
    case "geagendeerd":
      return "Geagendeerd voor " + values.subcase.get('subcaseName');
    case "beslist":
      return "Beslist op " + moment(phase.get('date')).format('DD/MM/YYYY');
    default:
      return label;
  }
}


export default helper(subcaseTimelineItemText);
