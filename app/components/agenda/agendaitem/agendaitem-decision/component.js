import Component from '@ember/component';


import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import {computed} from '@ember/object'

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vlc-padding-bottom--large'],
	store: inject(),
	isEditing: false,
	agendaitem: null,
	subcase:null,

	item: computed('subcase.decision', function() {
		return this.get('subcase.decision');
	}),

	async addDecision(subcase) {
		const { agendaitem } = this;
		let decision = this.store.createRecord("decision", {
			subcase: await subcase,
			shortTitle: await subcase.get('shortTitle'),
			approved:false
		});
		await decision.save()
		await agendaitem.belongsTo('subcase').reload();
		await subcase.belongsTo('decision').reload();
	},

	actions: {
		async toggleIsEditing() {
			const { subcase } = this;
			const decision = await subcase.get('decision');
			if (!decision) {
				await this.addDecision(subcase);
			}
			this.toggleProperty('isEditing');
		}
	}
});
