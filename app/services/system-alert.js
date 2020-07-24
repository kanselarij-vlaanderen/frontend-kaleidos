/* eslint-disable class-methods-use-this */
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

  get currentAlerts() {
    const now = new Date();
    return A(this.alerts.filter((alert) => alert.beginDate < now && alert.endDate > now));
  }

  get futureAlerts() {
    const now = new Date();
    return A(this.alerts.filter((alert) => alert.beginDate > now));
  }

  get unconfirmedAlerts() {
    return A(this.currentAlerts.filter((alert) => !alert.confirmed));
  }

  constructor() {
    super(...arguments);
    this.lifecycle();
  }

  async lifecycle() {
    try {
      await this.updateAlerts();
    } finally {
      later(this, this.lifecycle, this.updateInterval);
    }
  }

  @action
  confirmAlert(alert) {
    alert.set('confirmed', true);
  }

  async updateAlerts() {
    /*
     * Below query fetches all alerts with end date greater then start of the day.
     * This makes for only 1 unique request per day, which is good for request caching.
     */
    const today = moment().startOf('day')
      .format();
    const alerts = await this.store.query('alert', {
      filter: {
        ':gte:end-date': today,
      },
      sort: '-begin-date',
      include: 'type',
      page: {
        size: 10,
      },
    });
    // Ensure that the client-local "confirmed" mark doesn't get erased when refreshing
    const confirmedAlertIds = this.alerts.filterBy('confirmed').mapBy('id');
    const prevConfirmedAlerts = alerts.filter((alert) => confirmedAlertIds.includes(alert.id));
    prevConfirmedAlerts.setEach('confirmed', true);

    this.alerts = A(alerts);
  }
}
