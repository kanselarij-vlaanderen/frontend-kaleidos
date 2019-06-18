import Component from '@ember/component';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import ModelManageMixin from 'fe-redpencil/mixins/model-manage-mixin';

export default Component.extend(ModelManageMixin, {
	classNames: ["vl-u-spacer"],
	modelName: null,

	title: getCachedProperty('label'),

	actions: {
		async editModel() {
			this.set('isLoading', true);
			const model = await this.get('item');
			model.set('label', this.get('title'));
			model.save().then(() => {
				this.set('title', null);
				this.set('isLoading', false);
				this.set('isEditing', false);
			});
		},

		createModel() {
			this.set('isLoading', true);
			const governmentDomain = this.store.createRecord(this.get('modelName'), {
				label: this.get('title')
			});
			governmentDomain.save().then(() => {
				this.set('title', null);
				this.set('isLoading', false);
				this.set('isAdding', false);
			});
		}
	}
})
