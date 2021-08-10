// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['auk-u-bg-alt'],
  routing: inject('-routing'),
  currentSession: inject(),
  title: null,
  routeModelPrefix: null,
  modelsForHierarchicalBack: null,

  shouldShowPrintButton: computed('routeModelPrefix', 'routing.currentRouteName', function() {
    return this.routing.get('currentRouteName').includes(`${this.routeModelPrefix}.overview`);
  }),

  routeModelAgendaitems: computed('routeModelPrefix', function() {
    return `${this.routeModelPrefix}.agendaitems`;
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    print() {
      window.print();
    },
  },
});
