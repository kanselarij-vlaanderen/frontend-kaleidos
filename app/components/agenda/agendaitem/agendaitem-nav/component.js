import Component from '@ember/component';

export default Component.extend({
	classNames: ['vl-tabs'],
	tagName:'ul',
	
	actions: {
		setAgendaItemSection(value) {
			this.setAgendaItemSection(value);
		}
	}
});
