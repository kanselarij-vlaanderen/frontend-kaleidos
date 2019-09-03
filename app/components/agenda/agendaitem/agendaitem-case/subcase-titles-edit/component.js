import Component from '@ember/component';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase, getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import { computed } from '@ember/object';

export default Component.extend(EditAgendaitemOrSubcase, {
	store: inject(),
	classNames: ["vl-form__group", "vl-u-bg-porcelain"],
	propertiesToSet: ['title', 'shortTitle', 'accessLevel', 'freezeAccessLevel'],

	isAgendaItem: computed('item.modelName', function() {
		return "agendaitem" == this.get('item.modelName');
	}),

	title: getCachedProperty('title'),
	accessLevel: getCachedProperty('accessLevel'),
	shortTitle: getCachedProperty('shortTitle'),
	freezeAccessLevel: getCachedProperty('freezeAccessLevel'),

	actions: {
		setAccessLevel(accessLevel) {
			this.set('accessLevel', accessLevel);
		},
	}
});
