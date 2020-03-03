import Service from '@ember/service';
import { set } from '@ember/object';

export default Service.extend({
  isPrinting: false,

  init() {
    this._super(...arguments);

    window.onbeforeprint = () => {
      set(this, 'isPrinting', true);
    };

    window.onafterprint = () => {
      set(this, 'isPrinting', false);
    };
  },
});
