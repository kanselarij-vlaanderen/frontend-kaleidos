import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Route.extend(ApplicationRouteMixin, {
  moment: inject(),
  intl: inject(),
  currentSession: inject(),
  routeAfterAuthentication: "agendas",

  beforeModel() {
    this.intl.setLocale('nl-be');
    this.get('moment').setTimeZone('Europe/Brussels');
    return this._loadCurrentSession();
  },

  sessionAuthenticated() {
    this._super(...arguments);
    this._loadCurrentSession();
  },

  sessionInvalidated() {
    const logoutUrl = ENV['torii']['providers']['acmidm-oauth2']['logoutUrl'];
    window.location.replace(logoutUrl);
  },

  _loadCurrentSession() {
    return this.currentSession.load().catch(() =>   this.session.invalidate());
  }  

});
