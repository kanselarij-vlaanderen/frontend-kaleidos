/**
 * Returns the a comma-separated string containing the minimal necessary include
 * paths. When a path is a complete prefix of another path, the shorter path
 * doesn't need to be part of the include parameter, so it gets removed by this
 * function.
 *
 * The function works by sorting the paths first, then doing a single pass over
 * the paths and discarding any path that is a prefix of its neighbour.
 *
 * @param {Array<string>} paths list of mu-cl-resources paths
 * @returns {string} String comma-separated string with the minimal paths
 */
export default function minimalInclude(paths) {
  return paths
    .sort((a, b) => {
      const splitA = a.split('.')
      const splitB = b.split('.')
      for (let i = 0; i < splitA.length; i++) {
        if (splitA[i] < splitB[i]) {
          return -1;
        } else if (splitA[i] > splitB[i]) {
          return 1;
        }
      }
      return 0;
    })
    .reduce((acc, path, i, arr) => {
      const nextPath = arr[i + 1] ?? '';
      return (nextPath.startsWith(path) ? acc : [...acc, path]);
    }, [])
    .join(',');
}
