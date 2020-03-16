import Service from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';

export default Service.extend({
  createVersionName: function (number) {
    let prefix = '';
    if (number > 1) {
      prefix = ' ';
    }
    let name = prefix + CONFIG.names[number];
    if (name === 'undefined') {
      return `${number || ''}`;
    } else {
      return name.toUpperCase();
    }
  }
});
