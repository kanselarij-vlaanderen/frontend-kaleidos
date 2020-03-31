import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-u-bg-alt'],
  routing: inject('-routing'),
  title: null,
  routeModelPrefix: null,

  shouldShowPrintButton: computed('routing.currentRouteName', function () {
    return this.routing.get('currentRouteName').includes(`${this.routeModelPrefix}.overview`);
  }),

  routeModelAgendaitems: computed('routeModelPrefix', function () {
    return this.routeModelPrefix + '.agendaitems';
  }),

  routeModelOverview: computed('routeModelPrefix', function () {
    return this.routeModelPrefix + '.overview';
  }),

  actions: {
    print() {
      this.print();
    },

    navigateBackToAgenda() {
      this.navigateBackToAgenda();
    }
  }
});
