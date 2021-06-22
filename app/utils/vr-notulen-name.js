import CONFIG from 'frontend-kaleidos/utils/config';

export default class VRNotulenName {
  static get regexGroups() {
    return Object.freeze({
      context: '(?<context>(VR)|(VE))',
      year: '(?<year>\\d{4})',
      sessionNr: '(?<sessionNr>\\d{2})',
      versionSuffix: `(?<versionSuffix>(${Object.values(CONFIG.latinAdverbialNumberals).map((suffix) => suffix.toUpperCase())
        .join(')|(')}))`.replace('()|', ''), // Hack to get out the value for piece '0'
    });
  }

  static get regex() {
    const regexGroup = VRNotulenName.regexGroups;
    return new RegExp(`^${regexGroup.context} PV ${regexGroup.year}/${regexGroup.sessionNr}${regexGroup.versionSuffix}?$`);
  }

  constructor(name) {
    this.name = name;
    if (!this.isValid) {
      throw new Error(`Invalid VR Notulen Name "${this.name}"`);
    }
  }

  toString() {
    return this.name;
  }

  parseMeta() {
    const match = VRNotulenName.regex.exec(this.name);
    if (!match) {
      throw new Error(`Couldn't parse VR Notulen Name "${this.name}"`);
    }
    const versionSuffix = match.groups.versionSuffix;
    let versionNumber = 1;
    if (versionSuffix) {
      versionNumber = CONFIG.numbersBylatinAdverbialNumberals[versionSuffix.toLowerCase()];
    }
    const meta = {
      context: match.groups.context,
      year: parseInt(match.groups.year, 10),
      sessionNr: parseInt(match.groups.sessionNr, 10),
      versionSuffix,
      versionNumber,
    };
    return meta;
  }

  get isValid() {
    return VRNotulenName.regex.test(this.name);
  }
}

export const compareFunction = function(parameterA, parameterB) {
  try {
    const metaA = parameterA.parseMeta();
    try { // Both names parse
      const metaB = parameterB.parseMeta();
      return (metaA.year - metaB.year) // Year ascending
        || (metaA.sessionNr - metaB.sessionNr) // Session number ascending
        || (metaA.versionNumber - metaB.versionNumber); // versionNumber ascending
    } catch { // Only a parses
      return -1;
    }
  } catch {
    try { // Only b parses
      parameterB.parseMeta();
      return 1;
    } catch { // Both don't parse
      return parameterA.name.localeCompare(parameterB.name);
    }
  }
};
