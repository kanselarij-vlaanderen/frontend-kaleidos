import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import moment from 'moment';

export default Route.extend({
  moment: inject(),
  intl: inject(),

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
      const alertToShow = alerts.get('firstObject');
      return alertToShow;
    }
    return null;
  }
});
