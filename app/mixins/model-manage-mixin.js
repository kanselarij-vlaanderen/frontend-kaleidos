import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';

export default Mixin.create({
	store: inject(),

	isAdding: false,
	isEditing: false,

	actions: {
		close() {
			this.close();
		},

		selectModel(model) {
			this.set('item', model);
		},

		toggleIsAdding() {
			this.toggleProperty('isAdding');
		},

		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		chooseDomain(domain) {
			this.set('domain', domain);
		},

		chooseField(field) {
			this.set('field', field);
		},

		removeModel() {
			alert('This action is not allowed. Please contact the system administrator.');
		},
	}
});
