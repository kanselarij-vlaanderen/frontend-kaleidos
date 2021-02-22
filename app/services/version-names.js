import Service from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';

// TODO unused service ?
export default Service.extend({
  createPieceName(number) {
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
