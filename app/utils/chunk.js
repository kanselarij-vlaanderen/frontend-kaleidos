// From: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_chunk

export default function chunk(input, size) {
  return input.reduce((arr, item, idx) => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};
