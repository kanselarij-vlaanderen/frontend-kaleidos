import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
	routing: inject('-routing'),
	sessionService: inject(),
	tagName: 'ul',
	classNames: ['vlc-toolbar__item'],
	
	selectedAgendaitemClass: computed('routing.currentRouteName', function () {
		const { routing } = this;
		if (routing.get('currentRouteName') === "agenda.agendaitems.agendaitem") {
			return "vlc-tabs-reverse__link--active";
		}
	}),

	selectedOverviewClass: computed('routing.currentRouteName', function () {
		const { routing } = this;
		if (routing.get('currentRouteName') === "agenda.agendaitems.index") {
			return "vlc-tabs-reverse__link--active";
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
