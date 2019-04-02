import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	classNames: ["vl-u-spacer--large"],
	isEditing: false,
	subcase: null,

	selectedPhase: computed('subcase', function () {
		return this.get('subcase.phases');
	}),

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		cancelEditing() {
			this.toggleProperty('isEditing');
		},

		choosePhase(phase) {
			this.set('selectedPhase', phase);
		},

		async saveChanges(subcase) {
			const phase = this.get('selectedPhase');
			const subcaseModel = this.store.peekRecord('subcase', subcase.get('id'));

			const subcasePhase = this.store.createRecord('subcase-phase',
				{
					date: new Date(),
					code: phase,
					subcase: subcaseModel
				});

			subcasePhase.save().then(() => {
				this.toggleProperty('isEditing');
			});
		}
	}
});
