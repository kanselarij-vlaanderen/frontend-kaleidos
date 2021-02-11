import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default class VRDocumentName {
  static get regexGroups() {
    return Object.freeze({
      date: '([12][90][0-9]{2} [0-3][0-9][01][0-9])',
      casePrefix: '(( VV)|())',  // VV = Vlaamse Veerkracht
      docType: '((DOC)|(DEC)|(MED))',
      caseNr: '(\\d{4})',
      index: '(\\d{1,3})',
      pieceSuffix: `((${Object.values(CONFIG.latinAdverbialNumberals).map((suffix) => suffix.toUpperCase())
        .join(')|(')}))`.replace('()|', ''), // Hack to get out the value for piece '0'
    });
  }

  static get looseRegex() {
    const regexGroup = VRDocumentName.regexGroups;
    return new RegExp(`VR ${regexGroup.date}${regexGroup.casePrefix} ${regexGroup.docType}\\.${regexGroup.caseNr}([/-]${regexGroup.index})?`);
  }

  static get strictRegex() {
    const regexGroup = VRDocumentName.regexGroups;
    return new RegExp(`^VR ${regexGroup.date}${regexGroup.casePrefix} ${regexGroup.docType}\\.${regexGroup.caseNr}(/${regexGroup.index})?${regexGroup.pieceSuffix}?$`);
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
    return this.strict ? VRDocumentName.strictRegex : VRDocumentName.looseRegex;
  }

  parseMeta() {
    const match = this.regex.exec(this.name);
    if (!match) {
      throw new Error(`Couldn't parse VR Document Name "${this.name}" (${this.strict ? 'strict' : 'loose'} parsing mode)`);
    }
    const meta = {
      date: moment(match[1], 'YYYY DDMM').toDate(), // TODO set moment "strict" parsing to true + throw error when "Invalid date"
      casePrefix: match[2],
      docType: match[5],
      caseNr: parseInt(match[9], 10),
      index: parseInt(match[11], 10),
      // pieceSuffix: TODO
      // pieceNr: TODO
    };
    if (this.strict) {
      return meta;
    }
    return meta;
  }

  // TODO: Mag misschien weg?
  // Will only be needed by backend renaming service
  // static fromMeta (meta) {
  //   const date = meta.date || Date();
  //   const docType = meta.docType || 'DOC';
  //   const caseNr = meta.caseNr.padStart(4, '0');
  //   const index = meta.index.toString();
  //   const pieceNr = meta.pieceNr || 1;
  //   const formattedDate = moment(date).format('YYYY DDMM');
  //
  //   return VRDocumentName(`VR ${formattedDate} ${docType}.${caseNr}/${index}${this.pieceSuffixes[pieceNr]}`);
  // }

  get isValid() {
    return VRDocumentName.strictRegex.test(this.name);
  }

  get withoutPieceSuffix() {
    return this.name.replace(new RegExp(`${VRDocumentName.regexGroups.pieceSuffix}$`, 'ui'), '');
  }

  withOtherPieceSuffix(pieceNr) {
    return `${this.withoutPieceSuffix}${CONFIG.latinAdverbialNumberals[pieceNr].toUpperCase()}`;
  }
}

export const compareFunction = function(parameterA, parameterB) {
  try {
    const metaA = parameterA.parseMeta();
    try { // Both names parse
      const metaB = parameterB.parseMeta();
      return (metaB.caseNr - metaA.caseNr) // Case number descending (newest first)
        || (metaA.index - metaB.index) // Index ascending
        || (metaB.date - metaA.date); // Date descending (newest first)
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
