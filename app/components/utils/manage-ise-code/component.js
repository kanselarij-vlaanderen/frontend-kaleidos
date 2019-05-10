import Component from '@ember/component';
import { inject } from '@ember/service';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend({
	classNames: ["vl-u-spacer"],
	store: inject(),
	modelName: null,

	name: getCachedProperty('name'),
	code: getCachedProperty('code'),

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
			this.set('code', null);
			this.set('name', null);
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
			model.set('name', this.get('name'));
			model.set('code', this.get('code'));
			model.save().then(() => {
				this.set('code', null);
				this.set('name', null);
				this.set('isEditing', false);
			});
		},

		createModel() {
			const governmentDomain = this.store.createRecord('ise-code', {
				name: this.get('name'),
				code: this.get('code')
			});
			governmentDomain.save().then(() => {
				this.set('code', null);
				this.set('name', null);
				this.set('isAdding', false);
			});
		}
	}
})
