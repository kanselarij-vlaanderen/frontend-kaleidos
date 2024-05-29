import CONFIG from 'frontend-kaleidos/utils/config';

export default class VRCabinetDocumentName {
  static get regexGroups() {
    return Object.freeze({
      type: '(?<type>.*)',
      index: '(?<index>\\d{1,3})',
      versionSuffix: `(?<versionSuffix>(${Object.values(CONFIG.latinAdverbialNumberals).map((suffix) => suffix.toUpperCase())
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

  get regex() {
    const regexGroup = VRCabinetDocumentName.regexGroups;
    return new RegExp(`(?<subject>.*?)(?:[/-]${regexGroup.type})?[/-]${regexGroup.index}${regexGroup.versionSuffix}?$`);
  }

  parseMeta() {
    const match = this.regex.exec(this.name);
    if (!match) {
      return {
        subject: this.name,
      };
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
