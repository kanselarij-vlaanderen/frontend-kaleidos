import CONFIG from 'frontend-kaleidos/utils/config';
import moment from 'moment';

/**
 * This code is 99% the same as vr-document-name.js and is used to cover some issues sorting legacy documents
 */
export default class VRLegacyDocumentName {
  static get regexGroups() {
    return Object.freeze({
      date: '(?<date>[12][90][0-9]{2} [0-3][0-9][01][0-9])',
      casePrefix: '(?<casePrefix>( VV)|())',  // VV = Vlaamse Veerkracht
      docType: '(?<docType>(DOC)|(DEC)|(MED))',
      caseNr: '(?<caseNr>\\d{4})',
      index: '(?<index>\\d{1,3})',
      versionSuffix: `(?<versionSuffix>(${Object.values(CONFIG.latinAdverbialNumberals).map((suffix) => suffix.toUpperCase())
        .join(')|(')}))`.replace('()|', ''), // Hack to get out the value for piece '0'
    });
  }

  static get looseRegex() {
    const regexGroup = VRLegacyDocumentName.regexGroups;
    return new RegExp(`VR ${regexGroup.date}${regexGroup.casePrefix} ${regexGroup.docType}\\.${regexGroup.caseNr}([/-]${regexGroup.index})?(.*?)${regexGroup.versionSuffix}?$`);
  }

  static get strictRegex() {
    const regexGroup = VRLegacyDocumentName.regexGroups;
    return new RegExp(`^VR ${regexGroup.date}${regexGroup.casePrefix} ${regexGroup.docType}\\.${regexGroup.caseNr}(/${regexGroup.index})?${regexGroup.versionSuffix}?$`);
  }

  constructor(name, options) {
    this.name = name;
    this.strict = !!options && !!options.strict;
    if (this.strict && !this.isValid) {
      throw new Error(`Invalid VR Document Name "${this.name}" (strict mode)`);
    }
  }

  toString() {
    return this.name;
  }

  get regex() {
    return this.strict ? VRLegacyDocumentName.strictRegex : VRLegacyDocumentName.looseRegex;
  }

  parseMeta() {
    const match = this.regex.exec(this.name);
    if (!match) {
      throw new Error(`Couldn't parse VR Document Name "${this.name}" (${this.strict ? 'strict' : 'loose'} parsing mode)`);
    }
    const versionSuffix = match.groups.versionSuffix;
    let versionNumber = 1;
    if (versionSuffix) {
      versionNumber = CONFIG.numbersBylatinAdverbialNumberals[versionSuffix.toLowerCase()];
    }
    const meta = {
      date: moment(match.groups.date, 'YYYY DDMM').toDate(), // TODO set moment "strict" parsing to true + throw error when "Invalid date"
      casePrefix: match.groups.casePrefix,
      docType: match.groups.docType,
      caseNr: parseInt(match.groups.caseNr, 10),
      // for legacy there is not always an index for the first document, so assuming index 0 in that case instead of NaN.
      index: parseInt(match.groups.index || 0, 10), 
      versionSuffix,
      versionNumber,
    };
    return meta;
  }

  get isValid() {
    return VRLegacyDocumentName.strictRegex.test(this.name);
  }

  get withoutVersionSuffix() {
    return this.name.replace(new RegExp(`${VRLegacyDocumentName.regexGroups.versionSuffix}$`, 'ui'), '');
  }

  withOtherVersionSuffix(pieceNr) {
    return `${this.withoutVersionSuffix}${CONFIG.latinAdverbialNumberals[pieceNr].toUpperCase()}`;
  }
}

export const compareFunction = function(parameterA, parameterB) {
  try {
    const metaA = parameterA.parseMeta();
    try { // Both names parse
      const metaB = parameterB.parseMeta();
      return (metaB.caseNr - metaA.caseNr) // Case number descending (newest first)
        || (metaA.index - metaB.index) // Index ascending
        || (metaB.date - metaA.date) // Date descending (newest first)
        // for legacy the sorting on versionNumber is reversed compared to normal. 
        || (metaA.versionNumber - metaB.versionNumber); // versionNumber ascending (newest last)
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
