import { helper } from '@ember/component/helper';

export function subcaseTimelineItemText(params, values) {
  const label = values.label
  switch (label.toLowerCase()) {
    case "geagendeerd":
      return "Geagendeerd voor " + values.subcase.get('subcaseName');
    default:
      return label;
  }

}


export default helper(subcaseTimelineItemText);
