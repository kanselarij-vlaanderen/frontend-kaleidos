import Service, { inject as service } from '@ember/service';
import { A } from '@ember/array';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';
import { action } from '@ember/object';

export default class SystemAlertService extends Service {
  @service store;

  @tracked alerts = A([]);
  updateInterval = 60 * 1000;

  get currentAlerts () {
    const now = new Date();
    return A(this.alerts.filter(a => a.beginDate < now && a.endDate > now));
  }

  get futureAlerts () {
    const now = new Date();
    return A(this.alerts.filter(a => a.beginDate > now));
  }

  get unconfirmedAlerts () {
    return A(this.currentAlerts.filter((a) => !a.confirmed));
  }

  constructor () {
    super(...arguments);
    this.lifecycle();
  }

  async lifecycle () {
    try {
      await this.updateAlerts();
    }
    finally {
      later(this, this.lifecycle, this.updateInterval);
    }
  }

  @action
  confirmAlert (alert) {
    alert.set('confirmed', true);
  }

  async updateAlerts() {
    const today = moment().startOf('day').format();
    const alerts = await this.store.query('alert', {
      filter: {
        ':gte:end-date': today,
      },
      sort: '-begin-date',
      include: 'type',
      page: { size: 10 }
    });
    // Ensure that the client-local "confirmed" mark doesn't get erased when refreshing
    const confirmedAlertIds = this.alerts.filterBy('confirmed').mapBy('id');
    const prevConfirmedAlerts = alerts.filter((a) => confirmedAlertIds.includes(a.id));
    prevConfirmedAlerts.setEach('confirmed', true);

    this.alerts = A(alerts);
  }
}
