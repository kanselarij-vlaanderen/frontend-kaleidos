import PlausibleService from 'ember-plausible/services/plausible';
import { inject as service } from '@ember/service';

export default class ExtendedPlausibleService extends PlausibleService {
  @service currentSession;
  @service router;
  @service session;

  firstEvent = true;

  constructor() {
    super(...arguments);

    this.router.on('routeDidChange', (transition) => {
      if (this.session.isAuthenticated && this.currentSession.role) {
        if (transition.from?.name === 'login') {
          super.trackEvent('Aanmelding (per rol)', { rol: this.currentSession.role.label });
        }
        if (!transition.from) {
          // transition.from === undefined when opening the app (by navigating to it or refreshing)
          super.trackEvent('Gebruikssessie (per rol)', { rol: this.currentSession.role.label });
        } else if (transition.from?.name !== transition.to?.name) {
          // Some buttons let you go to the current route, that shouldn't count as a page view
          super.trackEvent('Pageview (per rol)', { rol: this.currentSession.role.label });
        }
      }
    });
  }

  trackEvent(eventName, props = {}) {
    super.trackEvent(eventName, props);
    if (this.firstEvent) {
      super.trackEvent('Eerste actie', { eventName, ...props });
      this.firstEvent = false;
    }
  }
}
