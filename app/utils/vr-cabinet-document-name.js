import CONFIG from 'frontend-kaleidos/utils/config';

export default class VRCabinetDocumentName {
  static get regexGroups() {
    return Object.freeze({
      type: '(?<type>.*)',
      index: '(?<index>\\d{1,3})',
      versionSuffix: `(?<versionSuffix>(${Object.values(CONFIG.latinAdverbialNumberals).map((suffix) => suffix?.toUpperCase())
        .join(')|(')}))`.replace('()|', ''), // Hack to get out the value for piece '0'
      confidential: '(?<confidential>VERTROUWELIJK|vertrouwelijk)', //
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
    // parsing confidential is also difficult in this regex, it will be included in type just as suffix
    const regexGroup = VRCabinetDocumentName.regexGroups;
    return new RegExp(`(?<subject>.*)?[/-]${regexGroup.index}(?:[/-]${regexGroup.type})${regexGroup.versionSuffix}?$`);
  }

  get regexTypeNumberConfidential() {
    const regexGroup = VRCabinetDocumentName.regexGroups;
    // versionSuffex is probably not in the right location here, but realistically this is only used for first upload and version should never be present
    return new RegExp(`(?<subject>.*)(?:[/-]${regexGroup.type})[/-]${regexGroup.index}${regexGroup.versionSuffix}?(?:[\\s/-]*${regexGroup.confidential})?$`);
  }

  parseMeta() {
    let confidential = false;
    let match = this.regexNumberType.exec(this.name);
    if (!match || !match.groups.type) {
      match = this.regexTypeNumberConfidential.exec(this.name);
      if (!match || !match.groups.type) {
        return {
            subject: this.name,
            index: parseInt(match?.groups.index, 10),
        };
      } else {
        confidential = match.groups.confidential ? true : false;
      }
    } else {
      const trimmedtype = match.groups.type.replace(/[\s-]*VERTROUWELIJK/i, '');
      if (trimmedtype.length < match.groups.type.length) {
        confidential= true;
        match.groups.type = trimmedtype;
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
