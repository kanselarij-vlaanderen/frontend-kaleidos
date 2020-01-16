import CONFIG from 'fe-redpencil/utils/config';
// import moment from 'moment';

export default class VRDocumentName {
  get versionSuffixes () {
    return CONFIG.latinAdverbialNumberals;
  }

  get versionSuffixesRegexGroup () {
    const str = '((' + Object.values(this.versionSuffixes).join(')|(') + '))';
    return str.replace('()|', ''); // Hack to get out the value for version '0'
  }

  get validityRegex () {
    return new RegExp('^VR [12][0-9]{3} [0-3][0-9][01][0-9] (DOC)|(DEC)\\.[0-9]{4}(/[0-9]{1,3})?' + this.versionSuffixesRegexGroup + '$');
  }

  constructor(name) {
    this.name = name;
  }

  // Will only be needed by backend renaming service
  // static fromMeta (meta) {
  //   const date = meta.date || Date();
  //   const docType = meta.docType || 'DOC';
  //   const caseNr = meta.caseNr.padStart(4, '0');
  //   const index = meta.index.toString();
  //   const versionNr = meta.versionNr || 1;
  //   const formattedDate = moment(date).format('YYYY DDMM');
  //
  //   return VRDocumentName(`VR ${formattedDate} ${docType}.${caseNr}/${index}${this.versionSuffixes[versionNr]}`);
  // }

  get isValid() {
    return this.validityRegex.test(this.name);
  }

  get withoutVersionSuffix() {
    return this.name.replace(new RegExp(this.versionSuffixesRegexGroup + '$', 'ui'), '');
  }

  withOtherVersionSuffix (versionNr) {
    return `${this.withoutVersionSuffix}${this.versionSuffixes[versionNr].toUpperCase()}`
  }
}
