/**
 * Returns the a comma-separated string containing the minimal necessary include
 * paths. When a path is a complete prefix of another path, the shorter path
 * doesn't need to be part of the include parameter, so it gets removed by this
 * function.
 *
 * The function works by iterating over each path and storing only paths that
 * aren't a prefix of other paths. For each path, we iterate over all other
 * paths and make sure that (1) the current path is not a prefix of another path
 * and (2) that other paths are not full prefix of the current path. If (1), we
 * discard the current path, if (2) we discord the other path.
 *
 * Not the most efficient, but given the small input it will handle it should be
 * okay.
 *
 * @param {Array<string>} paths list of mu-cl-resources paths
 * @returns {string} String comma-separated string with the minimal paths
 */
export default function minimalInclude(paths) {
  return paths
    .reduce((acc, path, i, arr) => {
      let isPrefix = false;
      arr.slice(i + 1).forEach((otherPath, j) => {
        if (path.includes(`${otherPath}.`)) {
          arr.splice(i + j + 1, 1);
          // We deleted an element further down the array, decrease the index so
          // it still points to the right element
          i--;
        }
        if (!isPrefix) {
          isPrefix = otherPath.includes(`${path}.`)
        }
      });
      if (isPrefix) return acc;
      return [...acc, path];
    }, [])
    .join(',');
}
