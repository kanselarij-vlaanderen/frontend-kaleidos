import CONFIG from 'frontend-kaleidos/utils/config';

export default class VRCabinetDocumentName {
  static get regexGroups() {
    return Object.freeze({
      type: '(?<type>.*)',
      index: '(?<index>\\d{1,3})',
      versionSuffix: `(?<versionSuffix>(${Object.values(CONFIG.latinAdverbialNumberals).map((suffix) => suffix?.toUpperCase())
        .join(')|(')}))`.replace('()|', ''), // Hack to get out the value for piece '0'
      confidential: '(?<confidential>VERTROUWELIJK)', //
    });
  }

  constructor(name) {
    this.name = name?.trim();
    this.parsed = this.parseMeta();
  }

  toString() {
    return this.name;
  }

  get regexConfidential() {
    // the group before confidential group matches greedily after index is found to include all extra spaces and dashes
    const regexGroup = VRCabinetDocumentName.regexGroups;
    return new RegExp(`(?<subject>.*)[/-]${regexGroup.index}(?:.*${regexGroup.confidential})$`);
  }

  get regexNumberType() {
    // versionSuffix doesn't really work here, since type uses .*; even with tweaks, QUATER matches with TER
    const regexGroup = VRCabinetDocumentName.regexGroups;
    return new RegExp(`(?<subject>.*)?[/-]${regexGroup.index}(?:[/-]${regexGroup.type})${regexGroup.versionSuffix}?$`);
  }

  get regexTypeNumber() {
    const regexGroup = VRCabinetDocumentName.regexGroups;
    // versionSuffix is included here, but realistically this is only used for first upload and version should never be present
    return new RegExp(`(?<subject>.*)(?:[/-]${regexGroup.type})[/-]${regexGroup.index}${regexGroup.versionSuffix}?$`);
  }

  parseMeta() {
    let confidential = false;
    let strippedName = this.name;
    let confidentialMatch = this.regexConfidential.exec(this.name.toUpperCase());
    if (confidentialMatch?.groups.confidential) {
      confidential = true;
      // if found here it matches the group confidential, but it could still be in subject which the regex can't see.
      // we need to replace "vertrouwelijk" in any case in this.name without changing the actual subject
      const indexToCut = confidentialMatch.groups.subject.length;
      strippedName = this.name.substring(0, indexToCut) + (this.name.substring(indexToCut).replace(/[\s-]*VERTROUWELIJK/i, ''));
    }

    let match = this.regexNumberType.exec(strippedName);
    if (!match || !match.groups.type) {
      match = this.regexTypeNumber.exec(strippedName);
      if (!match || !match.groups.type) {
        return {
            subject: this.name,
            index: parseInt(match?.groups.index, 10),
        };
      }
    }

    const subject = match.groups.subject?.trim();
    const versionSuffix = match.groups.versionSuffix;
    let versionNumber = 1;
    if (versionSuffix) {
      versionNumber = CONFIG.numbersBylatinAdverbialNumberals[versionSuffix.toLowerCase()];
    }
    const meta = {
      subject,
      type: match.groups.type,
      index: parseInt(match.groups.index, 10),
      versionSuffix,
      versionNumber,
      confidential
    };
    return meta;
  }
}
