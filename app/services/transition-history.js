import Service, { inject as service } from '@ember/service';

export default class TransitionHistoryService extends Service {
  // statefull service to be able to go back in the application history without having to rely on browser history
  @service router;
  transitionHistory = [];
  transitioningToBack = false;

  registerTransition() {
    if (!this.transitioningToBack) {
      const pathWithParams= window.location.pathname + window.location.search;
      this.transitionHistory.push(pathWithParams);
    }
    this.transitioningToBack = false;
  }

  goBack(fallBackRoute) {
    let last = this.transitionHistory.pop();
    this.transitioningToBack = true;
    if (last) {
      this.router.transitionTo(last);
    } else if (history.length > 1) {
      history.back(); // may go outside of application
    } else if (fallBackRoute) {
      this.router.transitionTo(fallBackRoute);
    } else {
      this.router.transitionTo('/overzicht');
    }
    // after transitioning we want to register again
    this.transitioningToBack = false;
  }
}