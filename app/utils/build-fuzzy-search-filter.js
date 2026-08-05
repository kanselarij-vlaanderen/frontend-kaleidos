/**
 * @param {string} searchText The raw search box content.
 * @param {string[]} attributes The (JSON-key) attributes to search across,
 *   e.g. ['first-name', 'last-name', 'email'].
 * @returns {Object} A map of query-param keys to values, ready to be merged
 *   into the options passed to `store.query`. Empty when there is nothing to
 *   search for.
 */
export default function buildFuzzySearchFilter(searchText, attributes) {
  const filter = {};
  if (!searchText) {
    return filter;
  }

  const words = searchText.trim().split(/\s+/).filter(Boolean);
  words.forEach((word, index) => {
    // A unique `:or:` suffix per word makes each word its own OR-group, and the
    // groups are AND-combined by mu-cl-resources.
    attributes.forEach((attribute) => {
      filter[`filter[:or:${index}][${attribute}]`] = word;
    });
  });

  return filter;
}
