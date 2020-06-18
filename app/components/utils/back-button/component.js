import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  router: inject(),
  defaultRoute: 'agendas.overview',
  actions: {
    goToParentRoute() {
      const parentRoute = this.router.currentRoute.parent;
      if (parentRoute && parentRoute.name !== 'application') {
        this.router.transitionTo(parentRoute.name);
      }
    },
  },
});
