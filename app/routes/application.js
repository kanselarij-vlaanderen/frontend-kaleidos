import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import moment from 'moment';

export default Route.extend({
  moment: inject(),
  intl: inject(),
  toast: inject(),

  sendInitWarning(alert) {
    this.get('toast').warning(alert.get('message'), alert.get('title'),
      {
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
      })
  },

  beforeModel() {
    this.intl.setLocale('nl-be');
  },

  async model() {
    const dateOfToday = moment().format();
    const alerts = await this.store.query('alert',{
      filter: { 
                ':gte:end-date': dateOfToday,
                ':lte:begin-date': dateOfToday
              }
    })
    if(alerts.get('length') > 0) {
      this.sendInitWarning(alerts.get('firstObject'));
    }
    
  }
});
