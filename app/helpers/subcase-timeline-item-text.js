import { helper } from '@ember/component/helper';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';

export function subcaseTimelineItemText(params, values) {
  const label = values.label;
  const phase = values.phase;
  switch (label.toLowerCase()) {
    case CONFIG.onAgendaLabel:
      return "Geagendeerd voor " + values.subcase.get('subcaseName');
    case CONFIG.decidedLabel:
      return "Beslist op " + moment(phase.get('date')).format('DD/MM/YYYY');
    default:
      return label;
  }
}


export default helper(subcaseTimelineItemText);
