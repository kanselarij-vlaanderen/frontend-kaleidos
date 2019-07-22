import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	classNameBindings: ["vlc-agenda-items-new__sub-item"],
	agendaItem: undefined,

	async click() {
		this.selectAgendaItem(this.agendaItem);
	},

	actions: {
	}
});
