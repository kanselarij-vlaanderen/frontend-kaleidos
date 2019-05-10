import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend({
	classNames: ["vl-u-spacer"],
	store: inject(),
	modelName: null,

	title: getCachedProperty('label'),

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

		removeModel() {
			alert('This action is not allowed. Please contact the system administrator.');
		},

		async editModel() {
			const model = await this.get('item');
			model.set('label', this.get('title'));
			model.save().then(() => {
				this.set('title', null);
				this.set('isEditing', false);
			});
		},

		createModel() {
			const governmentDomain = this.store.createRecord(this.get('modelName'), {
				label: this.get('title')
			});
			governmentDomain.save().then(() => {
				this.set('title', null);
				this.set('isAdding', false);
			});
		}
	}
})
