import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	classNames: ["vl-u-spacer--large"],
	isEditing: false,
	subcase: null,

	selectedThemes: computed('subcase', function() {
		return this.get('subcase.themes');
	}),

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		cancelEditing() {
			this.set('selectedThemes', this.get('subcase.themes'));
			this.toggleProperty('isEditing');
		},

		chooseTheme(themes) {
			this.set('selectedThemes', themes);
		},

		saveChanges(subcase) {
			const subcaseModel = this.store.peekRecord('subcase', subcase.get('id'));
			subcaseModel.set('themes', this.get('selectedThemes'));
			subcaseModel.save().then(() => {
				this.toggleProperty('isEditing');
			});
		}
	}
});
