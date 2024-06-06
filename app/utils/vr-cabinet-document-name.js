import CONFIG from 'frontend-kaleidos/utils/config';

export default class VRCabinetDocumentName {
  static get regexGroups() {
    return Object.freeze({
      type: '(?<type>.*)',
      index: '(?<index>\\d{1,3})',
      versionSuffix: `(?<versionSuffix>(${Object.values(CONFIG.latinAdverbialNumberals).map((suffix) => suffix?.toUpperCase())
        .join(')|(')}))`.replace('()|', ''), // Hack to get out the value for piece '0'
    });
  }

  constructor(name) {
    this.name = name?.trim();
    this.parsed = this.parseMeta();
  }

  toString() {
    return this.name;
  }

  get regexNumberType() {
    // versionSuffix doesn't really work here, since type uses .*; even with tweaks, QUATER matches with TER
    const regexGroup = VRCabinetDocumentName.regexGroups;
    return new RegExp(`(?<subject>.*)?[/-]${regexGroup.index}(?:[/-]${regexGroup.type})${regexGroup.versionSuffix}?$`);
  }

  get regexTypeNumber() {
    const regexGroup = VRCabinetDocumentName.regexGroups;
    return new RegExp(`(?<subject>.*)(?:[/-]${regexGroup.type})[/-]${regexGroup.index}${regexGroup.versionSuffix}?$`);
  }

  parseMeta() {
    let match = this.regexNumberType.exec(this.name);
    if (!match || !match.groups.type) {
      match = this.regexTypeNumber.exec(this.name);
      if (!match || !match.groups.type) {
        return {
          subject: this.name,
        };
      }
    }

    const subject = match.groups.subject;
    const versionSuffix = match.groups.versionSuffix;
    let versionNumber = 1;
    if (versionSuffix) {
      versionNumber = CONFIG.numbersBylatinAdverbialNumberals[versionSuffix.toLowerCase()];
    }
    const meta = {
      subject,
      type: match.groups.type,
      indexNrRaw: match.groups.index,
      index: parseInt(match.groups.index, 10),
      versionSuffix,
      versionNumber,
    };
    return meta;
  }
}
