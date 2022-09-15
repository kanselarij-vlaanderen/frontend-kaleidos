// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['auk-u-bg-alt'],
  router: inject(),
  title: null,
  routeModelPrefix: null,
  modelsForHierarchicalBack: null,

  shouldShowPrintButton: computed('routeModelPrefix', 'router.currentRouteName', function() {
    return this.router.currentRouteName.includes(`${this.routeModelPrefix}.overview`);
  }),

  routeModelAgendaitems: computed('routeModelPrefix', function() {
    return `${this.routeModelPrefix}.agendaitems`;
  }),

  routeModelOverview: computed('routeModelPrefix', function() {
    return `${this.routeModelPrefix}.overview`;
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    print() {
      window.print();
    },
  },
});
