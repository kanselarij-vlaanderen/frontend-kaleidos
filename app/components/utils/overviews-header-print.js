import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  classNames: ['auk-u-bg-alt'],
  routing: inject('-routing'),
  currentSession: inject(),
  title: null,
  routeModelPrefix: null,
  modelsForHierarchicalBack: null,

  shouldShowPrintButton: computed('routing.currentRouteName', function() {
    return this.routing.get('currentRouteName').includes(`${this.routeModelPrefix}.overview`);
  }),

  routeModelAgendaitems: computed('routeModelPrefix', function() {
    return `${this.routeModelPrefix}.agendaitems`;
  }),

  routeModelOverview: computed('routeModelPrefix', function() {
    return `${this.routeModelPrefix}.overview`;
  }),

  actions: {
    print() {
      window.print();
    },
  },
});
