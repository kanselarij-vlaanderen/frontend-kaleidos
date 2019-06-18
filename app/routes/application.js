import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import moment from 'moment';

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Route.extend(ApplicationRouteMixin, {
  moment: inject(),
  intl: inject(),
  currentSession: inject(),
  routeAfterAuthentication: "agendas",

  beforeModel() {
    this.get('moment').setLocale('nl');
    this.get('moment').set('allowEmpty', true);
    this.intl.setLocale('nl-be');
    return this._loadCurrentSession();
  },

  sessionAuthenticated() {
    this._super(...arguments);
    this._loadCurrentSession();
  },

  sessionInvalidated() {
    // const logoutUrl = ENV['torii']['providers']['acmidm-oauth2']['logoutUrl'];
    // window.location.replace(logoutUrl);
  },

  _loadCurrentSession() {
    return this.currentSession.load().catch(() => this.session.invalidate());
  },

  async model() {
    // load code-lists that are used alot.
    await this.store.findAll('policy-level');
    await this.store.findAll('mandatee');
    await this.store.findAll('case-type');
    await this.store.findAll('subcase-type');

    return await this.checkAlerts();
  },

  async checkAlerts() {
    const dateOfToday = moment().format();
    try {
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
    } catch (e) {
      return null;
    }
  }
});
