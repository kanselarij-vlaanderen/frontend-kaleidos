const STOP_WORDS = [
  'de',
  'en',
  'van',
  'ik',
  'te',
  'dat',
  'die',
  'in',
  'een',
  'hij',
  'het',
  'niet',
  'zijn',
  'is',
  'was',
  'op',
  'aan',
  'met',
  'als',
  'voor',
  'had',
  'er',
  'maar',
  'om',
  'hem',
  'dan',
  'zou',
  'of',
  'wat',
  'mijn',
  'men',
  'dit',
  'zo',
  'door',
  'over',
  'ze',
  'zich',
  'bij',
  'ook',
  'tot',
  'je',
  'mij',
  'uit',
  'der',
  'daar',
  'haar',
  'naar',
  'heb',
  'hoe',
  'heeft',
  'hebben',
  'deze',
  'u',
  'want',
  'nog',
  'zal',
  'me',
  'zij',
  'nu',
  'ge',
  'geen',
  'omdat',
  'iets',
  'worden',
  'toch',
  'al',
  'waren',
  'veel',
  'meer',
  'doen',
  'toen',
  'moet',
  'ben',
  'zonder',
  'kan',
  'hun',
  'dus',
  'alles',
  'onder',
  'ja',
  'eens',
  'hier',
  'wie',
  'werd',
  'altijd',
  'doch',
  'wordt',
  'wezen',
  'kunnen',
  'ons',
  'zelf',
  'tegen',
  'na',
  'reeds',
  'wil',
  'kon',
  'niets',
  'uw',
  'iemand',
  'geweest',
  'andere',
];

function removeStopWords(string) {
  let stringCopy = `${string}`;
  STOP_WORDS.forEach(
    (stopWord) => stringCopy = stringCopy.replace(
      new RegExp(`(\\W|^)${stopWord}(\\W|$)`, 'g'), '$1$2'
    )
  )
  return stringCopy;
}

export default function filterStopWords(string) {
  // We want to ignore strings that are wrapped in ""
  let substrings = string.split('"');
  if (substrings.length >= 3) {
    // Length >= 3 means there's at least one fully balanced set of "
    // All the odd entries are inside balanced ", we only want to strip
    // the even entries
    for (let i = 0; i < substrings.length; i += 2) {
      let substring = substrings[i];
      substrings[i] = removeStopWords(substring);
    }
  } else {
    // There are no balanced ", just strip the whole string
    substrings = [removeStopWords(string)];
  }

  const result = substrings.join('"');
  if (/\w/.test(result)) {
    // There is at least one character left
    return result;
  } else {
    // Only non-letters left, just use the original query
    return string;
  }
}

export {
  filterStopWords,
}
