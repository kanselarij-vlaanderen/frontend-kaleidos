import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
	routing: inject('-routing'),
	sessionService: inject(),
	tagName: 'ul',
	classNames: ['vlc-view-switch'],
	
	selectedAgendaitemClass: computed('routing.currentRouteName', function () {
		const { routing } = this;
		if (routing.get('currentRouteName') === "agenda.agendaitems.agendaitem") {
			return "vlc-view-switch__item--active";
		}
	}),

	selectedOverviewClass: computed('routing.currentRouteName', function () {
		const { routing } = this;
		if (routing.get('currentRouteName') === "agenda.agendaitems.index") {
			return "vlc-view-switch__item--active";
		}
	}),

	actions: {
		compareAgendas() {
			this.compareAgendas();
		},

		goToOverview() {
			this.clearSelectedAgendaItem();
		}
	}
});
