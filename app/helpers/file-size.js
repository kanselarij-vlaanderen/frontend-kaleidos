import { helper } from '@ember/component/helper';

export default helper(function fileSize([size]) {
  if (Number.isInteger(size)) {
    let roundedSize = size;
    const precision = 1;
    const threshold = 1000;
    const units = ["B", "kB", "MB", "GB", "TB"];
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      if (roundedSize < threshold) {
        return `${roundedSize.toFixed(precision)} ${unit}`;
      } else {
        roundedSize = roundedSize / threshold;
      }
    }
    return `${size} B`;
  }
  return size;
});
