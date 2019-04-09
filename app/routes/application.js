import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import moment from 'moment';

export default Route.extend({
  moment: inject(),
  intl: inject(),
  toast: inject(),

  async sendInitWarning(alert) {
    const options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-top-full-width",
      "preventDuplicates": true,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": 0,
      "extendedTimeOut": 0,
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut",
      "tapToDismiss": false
    };

    const type = await alert.get('type.label');
    if (type === 'Waarschuwing') {
      this.get('toast').warning(alert.get('message'), alert.get('title'), options);
    } else if (type === 'Dringend') {
      this.get('toast').error(alert.get('message'), alert.get('title'), options)
    }
  },

  beforeModel() {
    this.intl.setLocale('nl-be');
  },

  async model() {
    const dateOfToday = moment().format();
    const alerts = await this.store.query('alert', {
      filter: {
        ':gte:end-date': dateOfToday,
        ':lte:begin-date': dateOfToday
      },
      include: 'type'
    })
    if (alerts.get('length') > 0) {
      this.sendInitWarning(alerts.get('firstObject'));
    }
  }
});
