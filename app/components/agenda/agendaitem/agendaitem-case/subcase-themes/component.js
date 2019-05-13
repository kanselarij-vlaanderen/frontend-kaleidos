import Component from '@ember/component';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase, getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(EditAgendaitemOrSubcase, isAuthenticatedMixin, {
	store: inject(),
	classNames: ["vl-u-spacer-extended-bottom-l"],
	item: null,
	propertiesToSet: ['themes'],

	themes: getCachedProperty('themes'),

	actions: {
		chooseTheme(themes) {
			this.set('themes', themes);
		}
	}
});
