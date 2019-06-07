import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	classNames: ["vl-u-bg-alt"],
	title: null,

	routeModelPrefix: null,

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
