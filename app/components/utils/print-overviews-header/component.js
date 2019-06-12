import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
export default Component.extend({
	classNames: ["vl-u-bg-alt"],
	routing: inject('-routing'),
	title: null,
	routeModelPrefix: null,

	shouldShowPrintButton: computed('routing.currentRouteName', function () {
		return this.routing.get('currentRouteName').includes(`${this.routeModelPrefix}.overview`);
	}),

	routeModelAgendaitems: computed('routeModelPrefix', function () {
		return this.routeModelPrefix + ".agendaitems";
	}),

	routeModelOverview: computed('routeModelPrefix', function () {
		return this.routeModelPrefix + ".overview";
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
