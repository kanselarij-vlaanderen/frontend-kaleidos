import CONFIG from 'fe-redpencil/utils/config';

export default function (name, versionNumber) {
  let numeral = CONFIG.latinAdverbialNumberals[versionNumber].toUpperCase();
  if (name) {
    return `${name} ${numeral}`;
  } else {
    return `${versionNumber || ""}`; 
  }
}