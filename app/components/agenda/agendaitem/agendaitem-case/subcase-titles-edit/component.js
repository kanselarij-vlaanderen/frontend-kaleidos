import Component from '@ember/component';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase, getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Component.extend(EditAgendaitemOrSubcase, {
	store: inject(),
	classNames: ["vl-form__group", "vl-u-bg-porcelain"],
	
	propertiesToSet: computed('isAgendaItem', function() {
		let properties =  ['title', 'shortTitle', 'accessLevel', 'confidential'];
		if(this.isAgendaItem) {
			properties.push('showInNewsletter');
		}
		return properties;
	}),

	isAgendaItem: computed('item.modelName', function() {
		return "agendaitem" == this.get('item.modelName');
	}),

	isRemark: alias('item.showAsRemark'),

	title: getCachedProperty('title'),
	accessLevel: getCachedProperty('accessLevel'),
	shortTitle: getCachedProperty('shortTitle'),
	confidential: getCachedProperty('confidential'),
	showInNewsletter: getCachedProperty('showInNewsletter'),

	actions: {
		setAccessLevel(accessLevel) {
			this.set('accessLevel', accessLevel);
		},
	}
});
