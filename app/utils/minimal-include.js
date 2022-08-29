/**
 * Returns the a comma-separated string containing the minimal necessary include
 * paths. When a path is a complete prefix of another path, the shorter path
 * doesn't need to be part of the include parameter, so it gets removed by this
 * function.
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
