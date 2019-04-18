import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	classNames: ['vl-tabs vl-u-reset-margin'],
	tagName:'ul',
	activeAgendaItemSection:null,
	
	actions: {
		setAgendaItemSection(value) {
			this.setAgendaItemSection(value);
		}
	}
});
