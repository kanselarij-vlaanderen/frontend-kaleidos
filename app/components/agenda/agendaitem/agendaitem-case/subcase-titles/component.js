import Component from '@ember/component';
import { computed } from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	classNames: ["vl-u-spacer-extended-bottom-l"],

	agenda: computed('item', function () {
		return this.get('item.agenda.name');
	}),

	isAgendaItem: computed('item.constructor.modelName', function () {
		return "agendaitem" === this.get('item.constructor.modelName');
	}),

	case: computed('item', function () {
		const item = this.get('item');
		const caze = item.get('case');
		if (caze) {
			return caze
		}
		return item.get('subcase.case');
	}),

	actions: {
		toggleIsEditing() {
			this.toggleIsEditing();
		}
	}
});
