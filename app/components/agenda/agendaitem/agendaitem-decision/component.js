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
			title: await subcase.get('title'),
			shortTitle: await subcase.get('shortTitle'),
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
			} else if (!decision.get('title')) {
				decision.set('title', subcase.get('title'));
			}
			this.toggleProperty('isEditing');
		},
	}
});
