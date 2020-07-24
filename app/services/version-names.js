import Service from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';

export default Service.extend({
  createVersionName(number) {
    let prefix = '';
    if (number > 1) {
      prefix = ' ';
    }
    const name = prefix + CONFIG.names[number];
    if (name === 'undefined') {
      return `${number || ''}`;
    }
    return name.toUpperCase();
  },
});
