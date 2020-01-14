import {helper} from "@ember/component/helper";
import moment from "moment";
import CONFIG from "fe-redpencil/utils/config";

const formatDate = (date) => {
  if (!date) {
    return '';
  }
  return moment(date)
    .utc()
    .format("DD MMMM YYYY");
}

export function subcaseTimelineItemText(params, values) {
  const label = values.label || "";
  const phase = values.phase;
  const onAgendaInfo = values.onAgendaInfo;
  const isPostponed = values.isPostponed;
  const formattedDate = formatDate(onAgendaInfo);
  const date = formatDate(phase.get("date"));

  switch (label.toLowerCase()) {
    case CONFIG.onAgendaLabel:
      return `Geagendeerd op de agenda van ${formattedDate}`;
    case CONFIG.decidedLabel:
      if(isPostponed) {
        return `Er is beslist om dit agendapunt uit te stellen.`;
      }
      return `Beslist op de vergadering van ${formattedDate}`;
    case CONFIG.postponedLabel:
      return `Uitgesteld op de vergadering van ${formattedDate}`;
    case "ingediend voor agendering":
      return `Ingediend voor agendering op ${date}`;
    default:
      return label;
  }
}



export default helper(subcaseTimelineItemText);
