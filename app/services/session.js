import SessionService from 'ember-simple-auth/services/session';
import { inject as service } from '@ember/service';
import ENV from 'frontend-kaleidos/config/environment';

export default class ExtendedSessionService extends SessionService {
  @service currentSession;
  @service router;

  get unauthenticatedRouteName() {
    if (ENV.environment === 'development') {
      return 'mock-login';
    } else {
      return 'login';
    }
  }

  requireAuthentication(transition, routeOrCallback) {
    let authenticated = this.currentSession.isAuthenticated;
    if (!authenticated) {
      const { to } = transition;
      let paramNames = to.paramNames;
      let params = to.params;
      let parent = to.parent;
      while (parent) {
        if (parent.paramNames?.length) {
          paramNames = [...paramNames, ...parent.paramNames.reverse()];
          params = { ...params, ...parent.params };
        }
        parent = parent.parent;
      }
      // store the attemptedTransition to support redirect after ACM/IDM login
      localStorage.setItem('attemptedTransition',JSON.stringify({
        name: to.name,
        params: params,
        paramNames: paramNames?.reverse()
       }));
    } else {
      localStorage.removeItem('attemptedTransition');
    }
    return super.requireAuthentication(transition, routeOrCallback);
  }

  async handleAuthentication(routeAfterAuthentication) {
    try {
      await this.currentSession.load();
    } catch (error) { // eslint-disable-line no-unused-vars
      this.invalidate();
    }
    // The hack below handles a login attempt to ACM/IDM leaving the SPA
    // it replaces the super.handleAuthentication, which simply calls
    // ember-simple-auth/packages/ember-simple-auth/src/-internals/routing.js
    let transitionTo = localStorage.getItem('attemptedTransition');
    if (transitionTo) {
      try {
        transitionTo = JSON.parse(transitionTo);
        if (transitionTo.name) {
          let transitionParams = []; // params could be empty
          if (transitionTo.paramNames?.length) {
            transitionParams = transitionTo.paramNames.map((name) => {
              return transitionTo.params[name];
            });
          }
          this.router.transitionTo(transitionTo.name, ...transitionParams);
        } else {
          super.handleAuthentication(routeAfterAuthentication);
        }
      } catch {
        super.handleAuthentication(routeAfterAuthentication);
      }
    } else {
      super.handleAuthentication(routeAfterAuthentication);
    }
  }

  async handleInvalidation() {
    await this.currentSession.clear();
    const logoutUrl = ENV.torii.providers['acmidm-oauth2'].logoutUrl;
    try {
      super.handleInvalidation(logoutUrl);
    } catch (error) { // eslint-disable-line no-unused-vars
      this.router.transitionTo(this.unauthenticatedRouteName);
    }
  }

  async invalidate() {
    await this.currentSession.clear();
    return super.invalidate(...arguments);
  }
}
