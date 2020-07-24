import { helper } from '@ember/component/helper';

export function formatBytesize([bytes]) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return '0 Byte';
  }
  const sizesIndex = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return `${Math.round(bytes / Math.pow(1024, sizesIndex), 2)} ${sizes[sizesIndex]}`;
}

export default helper(formatBytesize);
