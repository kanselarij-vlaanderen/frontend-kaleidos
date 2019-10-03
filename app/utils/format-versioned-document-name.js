import CONFIG from 'fe-redpencil/utils/config';

export default function (name, versionNumber) {
  if (name) {
    if (versionNumber > 1) {
      let numeral = CONFIG.latinAdverbialNumberals[versionNumber].toUpperCase();
      return `${name} ${numeral}`;
    } else {
      return `${name}`;
    }
  } else {
    return `${versionNumber || ""}`; 
  }
}
