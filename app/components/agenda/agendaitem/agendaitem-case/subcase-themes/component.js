import Component from '@ember/component';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase, getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';


export default Component.extend(EditAgendaitemOrSubcase, {
	store: inject(),
	classNames: ["vl-u-spacer--large"],
	item: null,
	propertiesToSet: ['themes'],

	themes: getCachedProperty('themes'),

	actions: {
		chooseTheme(themes) {
			this.set('themes', themes);
		}
	}
});
