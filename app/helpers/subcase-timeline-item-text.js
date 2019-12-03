import { helper } from '@ember/component/helper';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';

export function subcaseTimelineItemText(params, values) {
  const label = values.label;
  const phase = values.phase;
  const subcaseNames = values.subcase.get('subcaseName');
  switch (label.toLowerCase()) {
    case CONFIG.onAgendaLabel:
      if (subcaseNames) {
        return "Geagendeerd voor " + subcaseNames;
      } else {
        return "Geagendeerd"
      }
    case CONFIG.decidedLabel:
      return "Beslist op " + moment(phase.get('date')).utc().format('DD/MM/YYYY');
    default:
      return label;
  }
}


export default helper(subcaseTimelineItemText);
