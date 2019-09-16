import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { alias } from '@ember/object/computed';

export default Component.extend(isAuthenticatedMixin, {
	routing: inject('-routing'),
	sessionService: inject(),
	tagName: 'ul',
	classNames: ['vlc-toolbar__item'],
	firstAgendaItemOfAgenda: alias('sessionService.firstAgendaItemOfAgenda'),

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

	selectedCompareClass: computed('routing.currentRouteName', function () {
		const { routing } = this;
		if (routing.get('currentRouteName') === "agenda.compare") {
			return "vlc-tabs-reverse__link--active";
		}
	}),

	selectedDocumentClass: computed('routing.currentRouteName', function () {
		const { routing } = this;
		if (routing.get('currentRouteName') === "agenda.documents") {
			return "vlc-tabs-reverse__link--active";
		}
	}),

	actions: {
		compareAgendas() {
			this.compareAgendas();
		},

		goToOverview() {
			this.clearSelectedAgendaItem();
		},

		navigateToDocuments() {
			this.navigateToDocuments();
		},
	}
});
