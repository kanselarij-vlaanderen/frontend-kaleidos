import Component from '@ember/component';

export default Component.extend({
	classNames: ['vl-tabs vl-u-reset-margin'],
	tagName:'ul',
	
	actions: {
		setAgendaItemSection(value) {
			this.setAgendaItemSection(value);
		}
	}
});
