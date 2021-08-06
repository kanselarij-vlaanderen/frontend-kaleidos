// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  router: inject(),
  defaultRoute: 'agendas.overview',
  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    goToParentRoute() {
      const parentRoute = this.router.currentRoute.parent;
      if (parentRoute && parentRoute.name !== 'application') {
        this.router.transitionTo(parentRoute.name);
      }
    },
  },
});
