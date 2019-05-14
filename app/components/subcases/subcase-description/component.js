import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { getCachedProperty, EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, EditAgendaitemOrSubcase, {
	classNames: ["vl-u-spacer-extended-bottom-l"],
	propertiesToSet: ['subcaseName', 'type'],

	item: computed('subcase', function () {
		return this.get('subcase');
	}),

	subcaseName: getCachedProperty('subcaseName'),
	type: getCachedProperty('type'),

	actions: {
		async selectType(type) {
			const subcase = this.get('subcase');
			const caze = await subcase.get('case');
			const subcaseName = await caze.getNameForNextSubcase(subcase, type);
			this.set('type', type);
			this.set('subcaseName', subcaseName);
		}
	}

});
