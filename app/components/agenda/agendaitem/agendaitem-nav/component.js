import Component from '@ember/component';

export default Component.extend({
	classNames: ['vl-tabs vl-u-reset-margin'],
	tagName:'ul',
	activeAgendaItemSection:null,
	
	actions: {
		setAgendaItemSection(value) {
			this.set('activeAgendaItemSection', value);
			this.setAgendaItemSection(value);
		}
	}
});
