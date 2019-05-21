import Component from '@ember/component';


import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object'

export default Component.extend(isAuthenticatedMixin, {
	classNames: ['vl-u-spacer'],
	store: inject(),
	isEditing: false,
	agendaitem: null,
	subcase: null,

	item: computed('subcase.decision', function () {
		return this.get('subcase.decision');
	}),

	async addDecision(subcase) {
		let decision = this.store.createRecord("decision", {
			subcase: await subcase,
			shortTitle: await subcase.get('title'),
			approved: false
		});
		subcase.set('decision', decision);
	},

	actions: {
		async toggleIsEditing() {
			const { subcase } = this;
			const decision = await subcase.get('decision');
			if (!decision) {
				await this.addDecision(subcase);
			} else if (!decision.get('shortTitle')) {
				decision.set('shortTitle', subcase.get('title'));
			}
			this.toggleProperty('isEditing');
		},
	}
});
