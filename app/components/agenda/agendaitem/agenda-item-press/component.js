import Component from '@ember/component';
import { computed } from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	agendaitem:null,
	isEditing:false,

	title: computed('agendaitem', function() {
		return this.agendaitem.get('subcase.title');
	}),

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		}
	}
});
