import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	sessionService: inject(),
	classNames: ["vlc-agenda-items-new"],
	classNameBindings: ['getClassNames'],
	selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
	agendaitems: null,
	isEditingOverview: false,

	getClassNames: computed('selectedAgendaItem', function () {
		if (this.get('selectedAgendaItem')) {
			return "vlc-agenda-items--small";
		} else {
			return "vl-u-spacer-extended-l vlc-agenda-items-new--spaced";
		}
	}),

	actions: {
		selectAgendaItem(agendaitem) {
			this.selectAgendaItem(agendaitem);
		},

		toggleIsEditingOverview() {
			this.toggleProperty('isEditingOverview', true);
		}
	}
});
