import { helper } from "@ember/component/helper";
import moment from "moment";
import CONFIG from "fe-redpencil/utils/config";

const formatDate = (date) => {
  if(!date) {
    return '';
  }
  return moment(date)
  .utc()
  .format("DD MMMM YYYY");
}

export function subcaseTimelineItemText(params, values) {
  const label = values.label;
  const phase = values.phase;
  const onAgendaInfo = values.onAgendaInfo;
  const formattedDate = formatDate(onAgendaInfo);
  const date = formatDate(phase.get("date"));

  switch (label.toLowerCase()) {
    case CONFIG.onAgendaLabel:
      return `Geagendeerd op de agenda van ${formattedDate}` ;
    case CONFIG.decidedLabel:
      return `Beslist op ${date}`;
    case CONFIG.postponedLabel:
      return `Uitgesteld op ${date}`;
    case "ingediend voor agendering":
      return `Ingediend voor agendering op ${date}`
    default:
      return label;
  }
}



export default helper(subcaseTimelineItemText);
